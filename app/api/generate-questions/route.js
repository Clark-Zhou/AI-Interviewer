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

    const content = await generateInterviewQuestionsWithDeepSeek({ jobInfo, resume });
    return Response.json({ content });
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
