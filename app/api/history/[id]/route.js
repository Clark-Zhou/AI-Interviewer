/**
 * 文件职责：读取或删除当前账号的一条完整云端面试历史。
 * 关联文件：lib/server/interviewHistory.js、components/InterviewHistoryPanel.js。
 * 注意事项：ID 查询与 RLS 双重限制账号归属，不返回其他账号的数据。
 */
import {
  getHistoryAuth, historyDetail, historyError, isHistoryId,
} from '../../../../lib/server/interviewHistory';

export async function GET(_request, { params }) {
  try {
    const { supabase, user } = await getHistoryAuth();
    if (!user) return historyError('请先登录后查看历史记录。', 401);
    const { id } = await params;
    if (!isHistoryId(id)) return historyError('历史记录不存在或无权访问。', 404);
    const { data, error } = await supabase.from('interview_sessions')
      .select('id,session_data,created_at').eq('id', id).eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!data) return historyError('历史记录不存在或无权访问。', 404);
    return Response.json({ session: historyDetail(data) }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return historyError('历史记录详情暂时无法读取。', 503);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { supabase, user } = await getHistoryAuth();
    if (!user) return historyError('请先登录后删除历史记录。', 401);
    const { id } = await params;
    if (!isHistoryId(id)) return historyError('历史记录不存在或无权访问。', 404);
    const { data, error } = await supabase.from('interview_sessions').delete()
      .eq('id', id).eq('user_id', user.id).select('id').maybeSingle();
    if (error) throw error;
    if (!data) return historyError('历史记录不存在或无权访问。', 404);
    return Response.json({ deleted: true });
  } catch {
    return historyError('删除历史记录失败，请稍后重试。', 503);
  }
}
