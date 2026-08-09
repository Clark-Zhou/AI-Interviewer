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
