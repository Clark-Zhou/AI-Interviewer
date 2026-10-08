/**
 * 文件职责：把当前账号仓库中的原文件转成可编辑的面试简历文本。
 * 关联文件：lib/server/resumeRepository.js、components/InterviewSimulator.js。
 * 注意事项：不修改或保存面试历史；解析失败时调用方保留当前输入。
 */
import {
  extractResumeText, getOwnedResume, getResumeAuth, RESUME_BUCKET, resumeError,
} from '../../../../../lib/server/resumeRepository';

export const runtime = 'nodejs';

export async function GET(_request, { params }) {
  try {
    const { supabase, user } = await getResumeAuth();
    if (!user) return resumeError('请先登录后选择简历。', 401);
    const { id } = await params;
    const row = await getOwnedResume(supabase, user.id, id);
    if (!row) return resumeError('简历不存在或无权访问。', 404);
    const { data: blob, error } = await supabase.storage.from(RESUME_BUCKET).download(row.storage_path);
    if (error || !blob) throw error || new Error('文件未找到');
    const text = await extractResumeText(Buffer.from(await blob.arrayBuffer()), row.file_type);
    return Response.json({ text }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return resumeError('简历暂时无法读取或解析，请重新上传后重试。', 503);
  }
}
