/**
 * 文件职责：前端 API 请求封装。
 *
 * 关联文件：
 * - components/InterviewSimulator.js：调用这里的方法触发问题生成和最终评价。
 * - app/api/generate-questions/route.js：生成面试问题的后端 API 地址。
 * - app/api/evaluate-interview/route.js：生成最终面试评价的后端 API 地址。
 * - app/api/parse-document/route.js：PDF/DOCX 解析成纯文本的后端 API 地址。
 *
 * 说明：
 * - 这个文件运行在浏览器端，只能调用自己的后端 API。
 * - 不要在这里写 DeepSeek API Key，也不要直接请求 DeepSeek。
 */

// 前端请求层：请求后端生成结构化面试问题。
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

  // 后端约定返回 { questions: [...] }，这里做一次轻量校验，避免组件拿到异常数据。
  if (!Array.isArray(data.questions)) {
    throw new Error('后端返回的问题列表格式不正确。');
  }

  return data.questions;
}

// 前端请求层：把 PDF/DOCX 交给项目后端一次性解析成纯文本。
export async function parseInterviewDocument({ file, target }) {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('target', target);

  const response = await fetch('/api/parse-document', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '文档解析失败，请稍后重试。');
  }

  if (typeof data.text !== 'string' || !data.text.trim()) {
    throw new Error('后端没有返回可用的文档文本。');
  }

  return data.text;
}

// 前端请求层：请求后端基于整场问答生成最终评价。
export async function evaluateInterview({ jobInfo, resume, questionAnswers }) {
  const response = await fetch('/api/evaluate-interview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      jobInfo,
      resume,
      questionAnswers,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || '生成最终评价失败，请稍后重试。');
  }

  // 后端约定返回 { evaluation: {...} }，这里做一次轻量校验。
  if (!data.evaluation || typeof data.evaluation !== 'object') {
    throw new Error('后端返回的最终评价格式不正确。');
  }

  return data.evaluation;
}
