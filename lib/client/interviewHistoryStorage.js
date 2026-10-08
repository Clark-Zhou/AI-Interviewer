/**
 * 文件职责：只读取旧版浏览器本地历史，供用户手动导入云端。
 *
 * 关联文件：
 * - components/InterviewHistoryPanel.js：读取旧记录并提示手动导入。
 * - lib/client/interviewHistoryApi.js：新记录通过项目 API 保存到云端。
 *
 * 说明：
 * - 这个文件只能在浏览器端使用，不能被服务端 API route 引入。
 * - 保留原 `ai-interview-sessions` 数据，不在此处新增、删除或自动上传。
 */

const STORAGE_KEY = 'ai-interview-sessions';

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

// 保留坏条目供逐条统计；整份 JSON 已损坏时记一条失败，不自动修改原始 key。
export function readLegacyInterviewSessions() {
  const storage = getBrowserLocalStorage();

  if (!storage) {
    return { sessions: [], malformedCount: 0 };
  }

  try {
    const rawSessions = storage.getItem(STORAGE_KEY);

    if (!rawSessions) {
      return { sessions: [], malformedCount: 0 };
    }

    const parsedSessions = JSON.parse(rawSessions);

    if (!Array.isArray(parsedSessions)) {
      return { sessions: [], malformedCount: 1 };
    }
    return {
      sessions: parsedSessions.slice(0, 10),
      malformedCount: Math.max(0, parsedSessions.length - 10),
    };
  } catch {
    return { sessions: [], malformedCount: 1 };
  }
}
