/**
 * 文件职责：统一限制 AI API 的请求体、登录态和每日调用名额。
 * 关联文件：两个 AI route、Supabase 受邀内测 SQL。
 * 注意事项：数据库不可用时拒绝调用，避免绕过费用限制。
 */
import { createSupabaseServerClient } from '../supabase/serverClient';

const MAX_BODY_BYTES = 1024 * 1024;
const MAX_JOB_TITLE = 160;
const MAX_JOB_INFO = 30000;
const MAX_RESUME = 30000;
const MAX_ANSWER = 12000;

export class PublicApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// 流式读取并限制实际字节数，不能只依赖可省略的 Content-Length。
export async function readAiRequest(request, withAnswers = false) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    throw new PublicApiError('请提交 JSON 请求。', 415);
  }
  const declaredSize = Number(request.headers.get('content-length'));
  if (declaredSize > MAX_BODY_BYTES) throw new PublicApiError('请求内容过大。', 413);
  const reader = request.body?.getReader();
  if (!reader) throw new PublicApiError('请求内容为空。', 400);
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        throw new PublicApiError('请求内容过大。', 413);
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof PublicApiError) throw error;
    throw new PublicApiError('请求读取失败，请重试。', 400);
  }
  let body;
  try {
    body = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks)));
  } catch {
    throw new PublicApiError('请求格式无效。', 400);
  }
  const validText = (value, max) => typeof value === 'string' && value.trim() && value.length <= max;
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      !validText(body.jobInfo, MAX_JOB_INFO) || !validText(body.resume, MAX_RESUME) ||
      (body.jobTitle !== undefined && (typeof body.jobTitle !== 'string' || body.jobTitle.length > MAX_JOB_TITLE))) {
    throw new PublicApiError('请提供有效的岗位信息和个人简历，且不要超过长度限制。', 400);
  }
  if (withAnswers) {
    if (!Array.isArray(body.questionAnswers) || body.questionAnswers.length < 1 || body.questionAnswers.length > 6 ||
        body.questionAnswers.some((item) => !item || typeof item !== 'object' ||
          ['category', 'question', 'reason', 'answer'].some((key) => !validText(item[key], MAX_ANSWER)))) {
      throw new PublicApiError('请提供 1 至 6 条完整的面试问答。', 400);
    }
  }
  return body;
}

// 必须先验证真实用户，再用其 JWT 调用原子额度 RPC。
export async function requireApiUser() {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error?.name === 'AuthSessionMissingError' || error?.code === 'session_not_found') {
      throw new PublicApiError('请先登录。', 401);
    }
    if (error) throw error;
    if (!user) throw new PublicApiError('请先登录。', 401);
  } catch (error) {
    if (error instanceof PublicApiError) throw error;
    throw new PublicApiError('暂时无法验证登录状态，请稍后重试。', 503);
  }
  return supabase;
}

export async function reserveAiCall() {
  const supabase = await requireApiUser();
  const { data, error } = await supabase.rpc('reserve_daily_ai_call');
  if (error) throw new PublicApiError('暂时无法确认调用额度，请稍后重试。', 503);
  if (data !== true) throw new PublicApiError('今日 AI 调用次数已用完，请明天再试。', 429);
}

// 只向浏览器返回固定文案，不透出上游响应、密钥或输入文本。
export function aiErrorResponse(error, fallback) {
  if (error instanceof PublicApiError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return Response.json({ error: fallback }, { status: 502 });
}
