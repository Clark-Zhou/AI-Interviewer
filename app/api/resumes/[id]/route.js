/**
 * 文件职责：删除当前账号的一份仓库简历及其原文件。
 * 关联文件：lib/server/resumeRepository.js、components/ResumeLibrary.js。
 * 注意事项：先标记 cleanup 释放名额，再尝试删除对象；残留对象随后重试。
 */
import {
  getOwnedResume, getResumeAuth, removeResumeObject, resumeError,
} from '../../../../lib/server/resumeRepository';

export async function DELETE(_request, { params }) {
  try {
    const { supabase, user } = await getResumeAuth();
    if (!user) return resumeError('请先登录后删除简历。', 401);
    const { id } = await params;
    const row = await getOwnedResume(supabase, user.id, id);
    if (!row) return resumeError('简历不存在或无权访问。', 404);
    // 标记成功后对用户视为已删除；Storage 故障时记录留待后续请求重试。
    await removeResumeObject(supabase, row).catch(async (error) => {
      const { data } = await supabase.from('resume_files').select('status')
        .eq('id', id).eq('user_id', user.id).maybeSingle();
      if (data?.status !== 'cleanup') throw error;
    });
    return Response.json({ deleted: true });
  } catch {
    return resumeError('删除失败，请稍后重试。', 503);
  }
}
