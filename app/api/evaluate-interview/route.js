/**
 * 文件职责：生成最终面试评价的后端 API 入口。
 *
 * 关联文件：
 * - lib/server/interviewEvaluation.js：真正调用 DeepSeek 并解析最终评价的服务端逻辑。
 * - lib/client/interviewApi.js：前端通过这里封装的方法请求本 API。
 * - .env.local：提供 DEEPSEEK_API_KEY 和可选的 DEEPSEEK_MODEL。
 *
 * 说明：
 * - 这个文件运行在服务端，可以读取环境变量。
 * - 这里只做请求解析、基础校验和统一响应，不直接写 prompt 或模型请求细节。
 */
import { evaluateInterviewWithDeepSeek } from '../../../lib/server/interviewEvaluation';

// 校验单条问答，确保最终评价接口拿到的是可批改的数据。
function validateQuestionAnswer(item, index) {
  const requiredFields = ['category', 'question', 'reason', 'answer'];

  for (const field of requiredFields) {
    if (typeof item?.[field] !== 'string' || !item[field].trim()) {
      return `第 ${index + 1} 条问答缺少有效的 ${field} 字段。`;
    }
  }

  return '';
}

// 后端入口：接收前端提交的整场问答，交给 DeepSeek 服务层生成最终评价。
export async function POST(request) {
  try {
    const { jobTitle, jobInfo, resume, questionAnswers } = await request.json();

    if (!jobInfo?.trim() || !resume?.trim()) {
      return Response.json(
        { error: '请提供岗位信息和个人简历。' },
        { status: 400 },
      );
    }

    if (!Array.isArray(questionAnswers) || questionAnswers.length === 0) {
      return Response.json(
        { error: '请提供至少一条已提交的面试问答。' },
        { status: 400 },
      );
    }

    for (let index = 0; index < questionAnswers.length; index += 1) {
      const validationError = validateQuestionAnswer(questionAnswers[index], index);

      if (validationError) {
        return Response.json({ error: validationError }, { status: 400 });
      }
    }

    // 服务层已经完成 AI 调用和 JSON 解析，这里只把标准 evaluation 对象返回给前端。
    const evaluation = await evaluateInterviewWithDeepSeek({
      jobTitle: typeof jobTitle === 'string' ? jobTitle : '',
      jobInfo,
      resume,
      questionAnswers,
    });

    return Response.json({ evaluation });
  } catch (error) {
    return Response.json(
      {
        error: error.message || '生成最终评价时发生未知错误。',
        detail: error.detail,
      },
      { status: error.status || 500 },
    );
  }
}
