/**
 * 文件职责：DeepSeek 服务端调用封装。
 *
 * 关联文件：
 * - lib/prompts/interviewQuestions.js：提供生成面试问题所需的 prompt。
 * - lib/server/parseAiQuestions.js：解析和校验 DeepSeek 返回的问题 JSON。
 * - app/api/generate-questions/route.js：调用这里的方法完成 AI 请求。
 * - .env.local：读取 DEEPSEEK_API_KEY 和 DEEPSEEK_MODEL。
 *
 * 说明：
 * - 这个文件只应该在服务端使用，不要被前端组件直接 import。
 * - API Key 只在这里读取，避免暴露给浏览器。
 */
import {
  INTERVIEW_QUESTION_SYSTEM_PROMPT,
  buildInterviewQuestionsPrompt,
} from '../prompts/interviewQuestions';
import { parseAiQuestions } from './parseAiQuestions';

const DEEPSEEK_CHAT_COMPLETIONS_URL = 'https://api.deepseek.com/chat/completions';

// 创建带状态码的错误，方便 API route 统一返回给前端。
function createApiError(message, status, detail) {
  const error = new Error(message);
  error.status = status;
  error.detail = detail;
  return error;
}

// 服务端 AI 调用层：负责读取环境变量、请求 DeepSeek，并返回结构化问题数组。
export async function generateInterviewQuestionsWithDeepSeek({ jobInfo, resume }) {
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
          content: INTERVIEW_QUESTION_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: buildInterviewQuestionsPrompt({ jobInfo, resume }),
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
    return parseAiQuestions(content);
  } catch (error) {
    // 解析失败通常说明模型没有严格遵守 JSON 格式，保留原始内容方便调试。
    throw createApiError('AI 返回格式无法解析。', 502, {
      reason: error.message,
      rawContent: content,
    });
  }
}
