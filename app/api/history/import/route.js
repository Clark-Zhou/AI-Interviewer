/**
 * 文件职责：把当前浏览器的一条旧本地历史手动导入当前账号。
 * 关联文件：lib/server/interviewHistory.js、components/InterviewHistoryPanel.js。
 * 注意事项：旧本地 ID 只用于当前账号内去重；不会删除浏览器里的原记录。
 */
import {
  getHistoryAuth, HISTORY_SELECT, historyError, historyRow, historySummary,
  HistoryValidationError, readHistoryBody,
} from '../../../../lib/server/interviewHistory';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const { supabase, user } = await getHistoryAuth();
    if (!user) return historyError('请先登录后导入历史记录。', 401);
    const body = await readHistoryBody(request);
    const row = historyRow(body?.session, user.id, { importing: true });
    const { data, error } = await supabase.from('interview_sessions')
      .insert(row).select(HISTORY_SELECT).single();
    if (error?.code === '23505') {
      const existing = await supabase.from('interview_sessions').select(HISTORY_SELECT)
        .eq('user_id', user.id).eq('local_id', row.local_id).maybeSingle();
      if (existing.error) throw existing.error;
      if (existing.data) return Response.json({ item: historySummary(existing.data), duplicate: true });
    }
    if (error) throw error;
    return Response.json({ item: historySummary(data), duplicate: false }, { status: 201 });
  } catch (error) {
    if (error instanceof HistoryValidationError) {
      return historyError(error.message, error.message.includes('2MB') ? 413 : 400);
    }
    return historyError('这条本地记录暂时无法导入，请稍后重试。', 503);
  }
}
