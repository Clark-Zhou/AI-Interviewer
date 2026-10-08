/**
 * 文件职责：分页列出当前账号历史、保存完整面试并清空云端历史。
 * 关联文件：lib/server/interviewHistory.js、components/InterviewSimulator.js、components/InterviewHistoryPanel.js。
 * 注意事项：每次验证当前 Supabase 用户；浏览器不能指定记录所有者。
 */
import {
  getHistoryAuth, HISTORY_PAGE_SIZE, HISTORY_SELECT, historyError,
  historyRow, historySummary, HistoryValidationError, readHistoryBody,
} from '../../../lib/server/interviewHistory';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const { supabase, user } = await getHistoryAuth();
    if (!user) return historyError('请先登录后查看历史记录。', 401);
    const rawOffset = new URL(request.url).searchParams.get('offset') || '0';
    if (!/^(0|[1-9]\d*)$/.test(rawOffset) ||
        !Number.isSafeInteger(Number(rawOffset)) ||
        Number(rawOffset) > Number.MAX_SAFE_INTEGER - HISTORY_PAGE_SIZE - 1) {
      return historyError('历史记录分页参数无效。');
    }
    const offset = Number(rawOffset);
    const { data, error } = await supabase.from('interview_sessions')
      .select(HISTORY_SELECT).eq('user_id', user.id)
      .order('created_at', { ascending: false }).order('id', { ascending: false })
      .range(offset, offset + HISTORY_PAGE_SIZE);
    if (error) throw error;
    const rows = data || [];
    return Response.json({
      items: rows.slice(0, HISTORY_PAGE_SIZE).map(historySummary),
      nextOffset: rows.length > HISTORY_PAGE_SIZE ? offset + HISTORY_PAGE_SIZE : null,
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return historyError('历史记录暂时无法读取，请检查云端配置或稍后重试。', 503);
  }
}

export async function POST(request) {
  try {
    const { supabase, user } = await getHistoryAuth();
    if (!user) return historyError('请先登录后保存历史记录。', 401);
    const body = await readHistoryBody(request);
    const row = historyRow(body?.session, user.id);
    const { data, error } = await supabase.from('interview_sessions')
      .insert(row).select(HISTORY_SELECT).single();
    if (error?.code === '23505') {
      // 重试复用同一个 ID；首次写入成功但响应丢失时仍视为保存成功。
      const existing = await supabase.from('interview_sessions').select(`${HISTORY_SELECT},content_hash`)
        .eq('id', row.id).eq('user_id', user.id).maybeSingle();
      if (existing.error) throw existing.error;
      if (existing.data?.content_hash === row.content_hash) {
        return Response.json({ item: historySummary(existing.data), duplicate: true });
      }
      if (existing.data) return historyError('记录 ID 已用于另一份面试内容。', 409);
      return historyError('记录 ID 已被占用。', 409);
    }
    if (error) throw error;
    return Response.json({ item: historySummary(data), duplicate: false }, { status: 201 });
  } catch (error) {
    if (error instanceof HistoryValidationError) {
      return historyError(error.message, error.message.includes('2MB') ? 413 : 400);
    }
    return historyError('历史记录暂时无法保存，请稍后重试。', 503);
  }
}

export async function DELETE() {
  try {
    const { supabase, user } = await getHistoryAuth();
    if (!user) return historyError('请先登录后清空历史记录。', 401);
    const { error } = await supabase.from('interview_sessions').delete().eq('user_id', user.id);
    if (error) throw error;
    return Response.json({ deleted: true });
  } catch {
    return historyError('清空历史记录失败，请稍后重试。', 503);
  }
}
