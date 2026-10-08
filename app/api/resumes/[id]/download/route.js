/**
 * 文件职责：向当前账号下载简历仓库保存的原文件。
 * 关联文件：lib/server/resumeRepository.js、components/ResumeLibrary.js。
 * 注意事项：私有 Storage 对象只经用户身份校验后返回，不生成公开链接。
 */
import {
  getOwnedResume, getResumeAuth, getResumeMime, RESUME_BUCKET, resumeError,
} from '../../../../../lib/server/resumeRepository';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  try {
    const { supabase, user } = await getResumeAuth();
    if (!user) return resumeError('请先登录后下载简历。', 401);
    const { id } = await params;
    const row = await getOwnedResume(supabase, user.id, id);
    if (!row) return resumeError('简历不存在或无权访问。', 404);
    const { data: blob, error } = await supabase.storage.from(RESUME_BUCKET).download(row.storage_path);
    if (error || !blob) throw error || new Error('文件未找到');
    return new Response(blob, { headers: {
      'Content-Type': getResumeMime(row.file_type),
      'Content-Disposition': `attachment; filename="resume.${row.file_type}"; filename*=UTF-8''${encodeURIComponent(row.original_name)}`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch {
    return resumeError('下载失败，请稍后重试。', 503);
  }
}
