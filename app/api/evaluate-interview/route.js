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
import { aiErrorResponse, readAiRequest, reserveAiCall } from '../../../lib/server/aiRequestGuard';

// 后端入口：接收前端提交的整场问答，交给 DeepSeek 服务层生成最终评价。
export async function POST(request) {
  try {
    const { jobTitle, jobInfo, resume, questionAnswers } = await readAiRequest(request, true);
    await reserveAiCall();

    // 服务层已经完成 AI 调用和 JSON 解析，这里只把标准 evaluation 对象返回给前端。
    const evaluation = await evaluateInterviewWithDeepSeek({
      jobTitle: typeof jobTitle === 'string' ? jobTitle : '',
      jobInfo,
      resume,
      questionAnswers,
    });

    return Response.json({ evaluation });
  } catch (error) {
    return aiErrorResponse(error, '生成评价失败，请稍后重试。');
  }
}
