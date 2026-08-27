/**
 * 文件职责：浏览器本地历史记录读写工具。
 *
 * 关联文件：
 * - components/InterviewSimulator.js：调用这里保存完整面试 session。
 * - components/InterviewHistoryPanel.js：调用这里读取、删除和清空本地历史记录。
 * - docs/TASKS.md：定义本地历史记录相关任务的数据结构和验收标准。
 * - docs/TESTING.md：记录本地历史记录的手动测试路径。
 *
 * 说明：
 * - 这个文件只能在浏览器端使用，不能被服务端 API route 引入。
 * - 当前阶段只使用 localStorage，不接数据库、登录或云端同步。
 */

const STORAGE_KEY = 'ai-interview-sessions';
const MAX_LOCAL_SESSIONS = 10;

function getBrowserLocalStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

// 生成本地唯一 id：时间戳保证大致排序，随机串降低同毫秒冲突概率。
export function createInterviewSessionId() {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 10);

  return `local-${timestamp}-${randomPart}`;
}

// 读取历史记录：坏数据或 JSON 解析失败时返回空数组，避免影响主流程。
export function getInterviewSessions() {
  const storage = getBrowserLocalStorage();

  if (!storage) {
    return [];
  }

  try {
    const rawSessions = storage.getItem(STORAGE_KEY);

    if (!rawSessions) {
      return [];
    }

    const parsedSessions = JSON.parse(rawSessions);

    if (!Array.isArray(parsedSessions)) {
      return [];
    }

    return parsedSessions.filter(isPlainObject);
  } catch {
    return [];
  }
}

// 保存完整面试 session：新记录放在最前面，并限制本地最多保留 10 条。
export function saveInterviewSession(session) {
  const storage = getBrowserLocalStorage();

  if (!storage) {
    throw new Error('当前浏览器不支持本地历史记录。');
  }

  if (!isPlainObject(session)) {
    throw new Error('历史记录数据格式不正确。');
  }

  const existingSessions = getInterviewSessions();
  const nextSessions = [
    session,
    ...existingSessions.filter((item) => item.id !== session.id),
  ].slice(0, MAX_LOCAL_SESSIONS);

  storage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));

  return session;
}

// 删除单条本地记录：只改当前浏览器 localStorage，不影响其他设备或云端状态。
export function deleteInterviewSession(sessionId) {
  const storage = getBrowserLocalStorage();

  if (!storage) {
    throw new Error('当前浏览器不支持本地历史记录。');
  }

  const existingSessions = getInterviewSessions();
  const nextSessions = existingSessions.filter((session) => session.id !== sessionId);

  storage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));

  return nextSessions;
}

// 清空全部本地记录：只移除当前浏览器中的历史 key。
export function clearInterviewSessions() {
  const storage = getBrowserLocalStorage();

  if (!storage) {
    throw new Error('当前浏览器不支持本地历史记录。');
  }

  storage.removeItem(STORAGE_KEY);

  return [];
}
