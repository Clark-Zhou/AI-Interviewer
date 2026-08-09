/**
 * 文件职责：前端 API 请求封装。
 *
 * 关联文件：
 * - components/InterviewSimulator.js：调用这里的方法触发问题生成。
 * - app/api/generate-questions/route.js：本文件请求的后端 API 地址。
 *
 * 说明：
 * - 这个文件运行在浏览器端，只能调用自己的后端 API。
 * - 不要在这里写 DeepSeek API Key，也不要直接请求 DeepSeek。
 */

// 前端请求层：统一管理页面发往后端 API 的请求。
export async function generateInterviewQuestions({ jobInfo, resume }) {
  const response = await fetch('/api/generate-questions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jobInfo,
      resume,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '生成问题失败，请稍后重试。');
  }

  return data.content;
}
