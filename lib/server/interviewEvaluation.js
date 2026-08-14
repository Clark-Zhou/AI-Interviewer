/**
 * 文件职责：最终面试评价的 DeepSeek 服务端调用封装。
 *
 * 关联文件：
 * - lib/prompts/interviewEvaluation.js：提供最终评价所需的 system prompt 和 user prompt。
 * - lib/server/parseInterviewEvaluation.js：解析和校验 DeepSeek 返回的最终评价 JSON。
 * - app/api/evaluate-interview/route.js：调用这里的方法完成最终评价请求。
 * - .env.local：读取 DEEPSEEK_API_KEY 和 DEEPSEEK_MODEL。
 *
 * 说明：
 * - 这个文件只应该在服务端使用，不要被前端组件直接 import。
 * - API Key 只在这里读取，避免暴露给浏览器。
 */
import {
  INTERVIEW_EVALUATION_SYSTEM_PROMPT,
  buildInterviewEvaluationPrompt,
} from '../prompts/interviewEvaluation';
import { parseInterviewEvaluation } from './parseInterviewEvaluation';

const DEEPSEEK_CHAT_COMPLETIONS_URL = 'https://api.deepseek.com/chat/completions';

// 创建带状态码的错误，方便 API route 统一返回给前端。
function createApiError(message, status, detail) {
  const error = new Error(message);
  error.status = status;
  error.detail = detail;
  return error;
}

// 服务端 AI 调用层：负责请求 DeepSeek，并返回结构化最终评价对象。
export async function evaluateInterviewWithDeepSeek({ jobInfo, resume, questionAnswers }) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

  if (!apiKey) {
    throw createApiError('缺少 DEEPSEEK_API_KEY，请先配置 .env.local。', 500);
  }

  const response = await fetch(DEEPSEEK_CHAT_COMPLETIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: INTERVIEW_EVALUATION_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: buildInterviewEvaluationPrompt({ jobInfo, resume, questionAnswers }),
        },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw createApiError('DeepSeek 请求失败。', 502, detail);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw createApiError('DeepSeek 没有返回有效内容。', 502);
  }

  try {
    return parseInterviewEvaluation(content);
  } catch (error) {
    // 解析失败通常说明模型没有严格遵守 JSON 格式，保留原始内容方便调试。
    throw createApiError('AI 返回的最终评价格式无法解析。', 502, {
      reason: error.message,
      rawContent: content,
    });
  }
}
