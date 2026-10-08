/**
 * 文件职责：列出当前账号的简历，并校验、预留名额后上传原文件。
 * 关联文件：lib/server/resumeRepository.js、supabase/migrations/20261008_resume_library.sql。
 * 注意事项：API 自行验证 Auth；前端不能指定 user_id 或 Storage 路径。
 */
import {
  cleanupPendingResumes, getResumeAuth, getResumeMime, removeResumeObject,
  reserveResume, RESUME_BUCKET, RESUME_SELECT, ResumeValidationError,
  resumeError, transitionResume, validateResumeUpload,
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
    try {
      await reserveResume(supabase, {
        id: reservedId, name: originalName, type, size: buffer.length,
      });
    } catch (reserveError) {
      if (reserveError.message?.includes('resume_limit_reached')) {
        reservedId = undefined;
        return resumeError('简历仓库最多保存 10 份，请先删除一份。', 409);
      }
      throw reserveError;
    }
    const { error: uploadError } = await supabase.storage.from(RESUME_BUCKET).upload(storagePath, buffer, {
      contentType: getResumeMime(type), upsert: false,
    });
    if (uploadError) throw uploadError;
    const { data, error: readyError } = await supabase.from('resume_files')
      .select(RESUME_SELECT).eq('id', reservedId).eq('user_id', user.id).single();
    if (readyError) throw readyError;
    await transitionResume(supabase, reservedId, 'ready');
    reservedId = undefined;
    return Response.json({ resume: data }, { status: 201 });
  } catch (error) {
    // 标记 cleanup 先释放名额；对象删除失败时后续列表/上传会继续清理。
    if (reservedId && supabase && user) {
      try { await removeResumeObject(supabase, { id: reservedId, storage_path: storagePath }); } catch {}
    }
    if (error instanceof ResumeValidationError) return resumeError(error.message);
    return resumeError('简历上传失败，请检查云端配置或稍后重试。', 503);
  }
}
