/**
 * 文件职责：统一历史记录 API 的身份校验、请求约束和数据映射。
 * 关联文件：app/api/history/、supabase/migrations/20261008_interview_history.sql。
 * 注意事项：完整 JD、简历和问答只写入当前账号的 session_data，不记录到日志。
 */
import { createSupabaseServerClient } from '../supabase/serverClient';
import { createHash } from 'node:crypto';

export const HISTORY_PAGE_SIZE = 20;
export const HISTORY_SELECT = 'id,job_title,overall_score,generation_source,created_at';
const MAX_SESSION_BYTES = 2 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_SESSION_BYTES + 64 * 1024;

export class HistoryValidationError extends Error {}

export function historyError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function getHistoryAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
}

export function isHistoryId(value) {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isText(value) {
  return typeof value === 'string' && Boolean(value.trim());
}

function isStringList(value) {
  return Array.isArray(value) && value.every(isText);
}

function hasCompleteEvaluation(value) {
  return isObject(value) &&
    Number.isInteger(value.overallScore) && value.overallScore >= 0 && value.overallScore <= 100 &&
    isText(value.summary) && isStringList(value.strengths) &&
    isStringList(value.risks) && isStringList(value.improvementSuggestions) &&
    isStringList(value.nextPracticeQuestions) &&
    Array.isArray(value.questionFeedback) && value.questionFeedback.length > 0 &&
    value.questionFeedback.every((item) =>
      isObject(item) && isText(item.question) && isText(item.feedback) &&
      isText(item.suggestion) && Number.isInteger(item.score) &&
      item.score >= 0 && item.score <= 100);
}

// 在解析 JSON 前限制请求体；旧记录逐条上传，避免一批数据阻断全部导入。
export async function readHistoryBody(request) {
  const length = Number(request.headers.get('content-length'));
  if (length > MAX_REQUEST_BYTES) throw new HistoryValidationError('历史记录内容过大，单条不能超过 2MB。');
  const raw = await request.text();
  if (Buffer.byteLength(raw) > MAX_REQUEST_BYTES) {
    throw new HistoryValidationError('历史记录内容过大，单条不能超过 2MB。');
  }
  try {
    return JSON.parse(raw);
  } catch {
    throw new HistoryValidationError('历史记录数据格式不正确。');
  }
}

export function validateHistorySession(session, { importing = false } = {}) {
  if (!isObject(session) || !isText(session.jobInfo) || !isText(session.resume) ||
      !Array.isArray(session.questions) || !Array.isArray(session.questionAnswers) ||
      !isObject(session.answers) || !hasCompleteEvaluation(session.evaluation)) {
    throw new HistoryValidationError('历史记录缺少完整面试内容。');
  }
  if (session.questions.length === 0 || session.questions.length > 50 ||
      session.questionAnswers.length !== session.questions.length ||
      session.questions.some((item) => !isObject(item) || !isText(item.category) ||
        !isText(item.question) || !isText(item.reason)) ||
      session.questionAnswers.some((item) => !isObject(item) || !isText(item.category) ||
        !isText(item.question) || !isText(item.reason) || !isText(item.answer))) {
    throw new HistoryValidationError('历史记录内容无效或题目数量过多。');
  }
  if (importing && (typeof session.id !== 'string' || !session.id.trim() || session.id.length > 128)) {
    throw new HistoryValidationError('本地历史记录缺少有效 ID。');
  }
  if (!importing && !isHistoryId(session.id)) {
    throw new HistoryValidationError('历史记录 ID 无效。');
  }
  const serialized = JSON.stringify(session);
  if (Buffer.byteLength(serialized) > MAX_SESSION_BYTES) {
    throw new HistoryValidationError('历史记录内容过大，单条不能超过 2MB。');
  }
  const timestamp = new Date(session.createdAt).getTime();
  const createdAt = importing && Number.isFinite(timestamp)
    ? new Date(timestamp).toISOString() : new Date().toISOString();
  const score = session.evaluation.overallScore;
  return {
    id: importing ? crypto.randomUUID() : session.id,
    localId: importing ? session.id : null,
    jobTitle: (typeof session.jobTitle === 'string' && session.jobTitle.trim()
      ? session.jobTitle.trim() : session.jobInfo.replace(/\s+/g, ' ').trim()).slice(0, 200),
    overallScore: Number.isInteger(score) && score >= 0 && score <= 100 ? score : null,
    generationSource: isObject(session.generationSource) ? session.generationSource : null,
    contentHash: createHash('sha256').update(serialized).digest('hex'),
    sessionData: session,
    createdAt,
  };
}

export function historyRow(session, userId, options) {
  const value = validateHistorySession(session, options);
  return {
    id: value.id, user_id: userId, local_id: value.localId,
    job_title: value.jobTitle, overall_score: value.overallScore,
    generation_source: value.generationSource,
    content_hash: value.contentHash,
    session_data: value.sessionData, created_at: value.createdAt,
  };
}

export function historySummary(row) {
  return {
    id: row.id, jobTitle: row.job_title || '',
    overallScore: row.overall_score, generationSource: row.generation_source,
    createdAt: row.created_at,
  };
}

export function historyDetail(row) {
  if (!isObject(row?.session_data)) throw new Error('历史记录内容不可用');
  return { ...row.session_data, id: row.id, createdAt: row.created_at };
}
