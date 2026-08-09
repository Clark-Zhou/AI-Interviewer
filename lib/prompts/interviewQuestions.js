/**
 * 文件职责：生成面试问题相关的 Prompt。
 *
 * 关联文件：
 * - lib/server/deepseek.js：调用这里的 prompt 并发送给 DeepSeek。
 * - app/api/generate-questions/route.js：通过 DeepSeek 服务层间接使用这里的 prompt。
 *
 * 说明：
 * - 后续如果要优化问题质量，优先改这个文件。
 * - 当前要求模型返回 JSON 文本，下一步可以进一步收紧为固定 schema。
 */

// 系统提示词：控制 AI 的角色、语气和回答方向。
export const INTERVIEW_QUESTION_SYSTEM_PROMPT =
  '你是一个严谨、具体、擅长求职面试准备的中文面试教练。';

// 用户提示词：把岗位信息和简历组织成生成面试问题的任务。
export function buildInterviewQuestionsPrompt({ jobInfo, resume }) {
  return `
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
}
