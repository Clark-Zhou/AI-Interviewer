// This API route receives job/resume text from the frontend and asks DeepSeek to generate interview questions.
export async function POST(request) {
  try {
    const { jobInfo, resume } = await request.json();

    // Basic validation before calling the AI provider.
    if (!jobInfo?.trim() || !resume?.trim()) {
      return Response.json(
        { error: '请提供岗位信息和个人简历。' },
        { status: 400 },
      );
    }

    // Keep secrets on the server. The frontend should never receive this key.
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const model = process.env.DEEPSEEK_MODEL || 'deepseek-v4-flash';

    if (!apiKey) {
      return Response.json(
        { error: '缺少 DEEPSEEK_API_KEY，请先配置 .env.local。' },
        { status: 500 },
      );
    }

    // Prompt for the first MVP step: generate role-specific interview questions only.
    const prompt = `
你是一个专业的模拟面试官。请根据岗位信息和个人简历，生成 6 个有针对性的面试问题。

要求：
1. 问题要结合岗位要求和简历经历，不要太泛泛。
2. 每个问题包含 category、question、reason 三个字段。
3. category 用中文短标签，例如：岗位匹配、项目经验、技能能力、行为问题、风险点。
4. 只返回 JSON，不要返回 Markdown。

岗位信息：
${jobInfo}

个人简历：
${resume}
`;

    // DeepSeek uses an OpenAI-compatible chat completions endpoint.
    const response = await fetch('https://api.deepseek.com/chat/completions', {
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
            content: '你是一个严谨、具体、擅长求职面试准备的中文面试教练。',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      return Response.json(
        { error: 'DeepSeek 请求失败。', detail },
        { status: 502 },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return Response.json(
        { error: 'DeepSeek 没有返回有效内容。' },
        { status: 502 },
      );
    }

    // For now, return the raw model text. The next step can parse it into a strict questions array.
    return Response.json({ content });
  } catch (error) {
    return Response.json(
      { error: '生成问题时发生未知错误。', detail: error.message },
      { status: 500 },
    );
  }
}
