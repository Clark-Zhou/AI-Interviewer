/**
 * 文件职责：生成面试问题相关的 Prompt。
 *
 * 关联文件：
 * - lib/server/deepseek.js：调用这里的 prompt 并发送给 DeepSeek。
 * - app/api/generate-questions/route.js：通过 DeepSeek 服务层间接使用这里的 prompt。
 *
 * 说明：
 * - 后续如果要优化问题质量，优先改这个文件。
 * - 当前要求模型返回固定 JSON 结构，方便后端解析和前端渲染。
 */

// 系统提示词：控制 AI 的角色、语气和回答方向。
export const INTERVIEW_QUESTION_SYSTEM_PROMPT =
  '你是一个严谨、具体、擅长求职面试准备的中文面试教练。';

// 用户提示词：把岗位信息和简历组织成生成面试问题的任务，并约束返回结构。
export function buildInterviewQuestionsPrompt({ jobTitle = '', jobInfo, resume }) {
  const normalizedJobTitle = String(jobTitle || '').trim();
  const jobTitleContext = normalizedJobTitle
    ? `岗位名称（辅助上下文，可为空）：\n${normalizedJobTitle}\n\n`
    : '';

  return `
你是一个专业的模拟面试官。请根据岗位信息和个人简历，生成 6 个有针对性的中文面试问题。

要求：
1. 问题要结合岗位要求和简历经历，不要太泛泛。
2. 每个问题都要考察一个明确能力点或风险点。
3. category 用中文短标签，例如：岗位匹配、项目经验、技能能力、行为问题、风险点。
4. reason 要说明为什么这个问题值得问。
5. 只返回 JSON，不要返回 Markdown，不要使用 \`\`\`json 包裹，不要添加额外解释。

返回格式必须严格符合：
{
  "questions": [
    {
      "category": "岗位匹配",
      "question": "问题文本",
      "reason": "为什么问这个问题"
    }
  ]
}

字段要求：
- questions 必须是数组。
- questions 必须正好包含 6 个问题。
- category、question、reason 都必须是非空字符串。

${jobTitleContext}岗位信息：
${jobInfo}

个人简历：
${resume}
`;
}
