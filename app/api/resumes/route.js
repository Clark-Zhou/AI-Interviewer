/**
 * 文件职责：列出当前账号的简历，并校验、预留名额后上传原文件。
 * 关联文件：lib/server/resumeRepository.js、supabase/migrations/20261008_resume_library.sql。
 * 注意事项：API 自行验证 Auth；前端不能指定 user_id 或 Storage 路径。
 */
import {
  cleanupPendingResumes, getResumeAuth, getResumeMime, RESUME_BUCKET,
  RESUME_SELECT, ResumeValidationError, resumeError, validateResumeUpload,
} from '../../../lib/server/resumeRepository';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const { supabase, user } = await getResumeAuth();
    if (!user) return resumeError('请先登录后查看简历仓库。', 401);
    await cleanupPendingResumes(supabase, user.id);
    const { data, error } = await supabase.from('resume_files').select(RESUME_SELECT)
      .eq('user_id', user.id).eq('status', 'ready').order('created_at', { ascending: false });
    if (error) throw error;
    return Response.json({ resumes: data || [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return resumeError('简历列表暂时无法读取，请检查云端配置或稍后重试。', 503);
  }
}

export async function POST(request) {
  let supabase;
  let user;
  let reservedId;
  let storagePath;
  try {
    ({ supabase, user } = await getResumeAuth());
    if (!user) return resumeError('请先登录后上传简历。', 401);
    const contentLength = Number(request.headers.get('content-length'));
    if (contentLength > 6 * 1024 * 1024) return resumeError('文件过大，请按格式限制选择简历。', 413);
    const formData = await request.formData();
    const { originalName, type, buffer } = await validateResumeUpload(formData.get('file'));
    await cleanupPendingResumes(supabase, user.id);

    // 先插入 pending 元数据，让数据库在并发上传时原子地预留 10 份名额。
    reservedId = crypto.randomUUID();
    storagePath = `${user.id}/${reservedId}.${type}`;
    const { error: reserveError } = await supabase.from('resume_files').insert({
      id: reservedId, user_id: user.id, original_name: originalName,
      file_type: type, size_bytes: buffer.length, storage_path: storagePath, status: 'pending',
    });
    if (reserveError) {
      reservedId = undefined;
      if (reserveError.message?.includes('resume_limit_reached')) {
        return resumeError('简历仓库最多保存 10 份，请先删除一份。', 409);
      }
      throw reserveError;
    }
    const { error: uploadError } = await supabase.storage.from(RESUME_BUCKET).upload(storagePath, buffer, {
      contentType: getResumeMime(type), upsert: false,
    });
    if (uploadError) throw uploadError;
    const { data, error: readyError } = await supabase.from('resume_files')
      .update({ status: 'ready' }).eq('id', reservedId).eq('user_id', user.id)
      .select(RESUME_SELECT).single();
    if (readyError) throw readyError;
    reservedId = undefined;
    return Response.json({ resume: data }, { status: 201 });
  } catch (error) {
    // Storage 和数据库不共享事务；任一步失败都尽量移除对象与预留行。
    if (reservedId && supabase && user) {
      const { error: cleanupError } = await supabase.storage.from(RESUME_BUCKET).remove([storagePath]);
      if (!cleanupError) {
        await supabase.from('resume_files').delete().eq('id', reservedId).eq('user_id', user.id);
      }
    }
    if (error instanceof ResumeValidationError) return resumeError(error.message);
    return resumeError('简历上传失败，请检查云端配置或稍后重试。', 503);
  }
}
