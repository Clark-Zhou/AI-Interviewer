/**
 * 文件职责：生成面试问题的后端 API 入口。
 *
 * 关联文件：
 * - lib/server/deepseek.js：真正调用 DeepSeek 的服务端逻辑。
 * - lib/client/interviewApi.js：前端通过这里封装的方法请求本 API。
 * - .env.local：提供 DEEPSEEK_API_KEY 和可选的 DEEPSEEK_MODEL。
 *
 * 说明：
 * - 这个文件运行在服务端，可以读取环境变量。
 * - 这里只做请求解析、基础校验和统一响应，不直接写 prompt 或模型请求细节。
 */
import { generateInterviewQuestionsWithDeepSeek } from '../../../lib/server/deepseek';

// 后端入口：接收前端请求，做基础校验，然后交给 DeepSeek 服务层处理。
export async function POST(request) {
  try {
    const { jobInfo, resume } = await request.json();

    if (!jobInfo?.trim() || !resume?.trim()) {
      return Response.json(
        { error: '请提供岗位信息和个人简历。' },
        { status: 400 },
      );
    }

    // 服务层已经完成 AI 调用和 JSON 解析，这里只把标准 questions 数组返回给前端。
    const questions = await generateInterviewQuestionsWithDeepSeek({ jobInfo, resume });
    return Response.json({ questions });
  } catch (error) {
    return Response.json(
      {
        error: error.message || '生成问题时发生未知错误。',
        detail: error.detail,
      },
      { status: error.status || 500 },
    );
  }
}
