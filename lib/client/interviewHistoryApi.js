/**
 * 文件职责：封装浏览器到项目云端历史 API 的请求。
 * 关联文件：components/InterviewSimulator.js、components/InterviewHistoryPanel.js。
 * 注意事项：浏览器只调用项目 API，不直接访问 Supabase 数据表。
 */
async function readResponse(response, fallback) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || fallback);
  return data;
}

export async function saveCloudInterviewSession(session) {
  const response = await fetch('/api/history', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session }),
  });
  return readResponse(response, '历史记录保存失败。');
}

export async function listCloudInterviewSessions(offset = 0) {
  const response = await fetch(`/api/history?offset=${offset}`, { cache: 'no-store' });
  return readResponse(response, '历史记录读取失败。');
}

export async function getCloudInterviewSession(id) {
  const response = await fetch(`/api/history/${encodeURIComponent(id)}`, { cache: 'no-store' });
  return readResponse(response, '历史记录详情读取失败。');
}

export async function deleteCloudInterviewSession(id) {
  const response = await fetch(`/api/history/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return readResponse(response, '删除历史记录失败。');
}

export async function clearCloudInterviewSessions() {
  const response = await fetch('/api/history', { method: 'DELETE' });
  return readResponse(response, '清空历史记录失败。');
}

export async function importLocalInterviewSession(session) {
  const response = await fetch('/api/history/import', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session }),
  });
  return readResponse(response, '导入本地历史记录失败。');
}
