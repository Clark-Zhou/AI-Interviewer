/**
 * 文件职责：删除当前账号的一份仓库简历及其原文件。
 * 关联文件：lib/server/resumeRepository.js、components/ResumeLibrary.js。
 * 注意事项：先删除 Storage 对象再删除元数据；失败时保留可重试入口。
 */
import {
  getOwnedResume, getResumeAuth, RESUME_BUCKET, resumeError,
} from '../../../../lib/server/resumeRepository';

export async function DELETE(_request, { params }) {
  try {
    const { supabase, user } = await getResumeAuth();
    if (!user) return resumeError('请先登录后删除简历。', 401);
    const { id } = await params;
    const row = await getOwnedResume(supabase, user.id, id);
    if (!row) return resumeError('简历不存在或无权访问。', 404);
    const { error: storageError } = await supabase.storage.from(RESUME_BUCKET).remove([row.storage_path]);
    if (storageError) throw storageError;
    const { error: deleteError } = await supabase.from('resume_files')
      .delete().eq('id', id).eq('user_id', user.id);
    if (deleteError) throw deleteError;
    return Response.json({ deleted: true });
  } catch {
    return resumeError('删除失败，请稍后重试。', 503);
  }
}
