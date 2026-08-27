/**
 * 文件职责：生成最终面试评价相关的 Prompt。
 *
 * 关联文件：
 * - lib/server/interviewEvaluation.js：调用这里的 prompt 并发送给 DeepSeek。
 * - lib/server/parseInterviewEvaluation.js：按这里约定的 JSON 结构解析 AI 返回。
 * - app/api/evaluate-interview/route.js：通过服务层间接使用这里的 prompt。
 *
 * 说明：
 * - 这个文件只负责管理最终评价 prompt，不负责调用模型或解析结果。
 * - 当前目标是一次性评价整场模拟面试，同时包含逐题反馈。
 */

// 系统提示词：控制 AI 作为面试教练时的评价标准和语气。
export const INTERVIEW_EVALUATION_SYSTEM_PROMPT =
  '你是一个严格、具体、建设性的中文面试教练，擅长根据岗位要求、简历背景和候选人回答给出可执行反馈。';

// 用户提示词：把岗位、简历、问题和回答组织成最终评价任务，并约束返回结构。
export function buildInterviewEvaluationPrompt({
  jobTitle = '',
  jobInfo,
  resume,
  questionAnswers,
}) {
  const normalizedJobTitle = String(jobTitle || '').trim();
  const jobTitleContext = normalizedJobTitle
    ? `岗位名称（辅助上下文，可为空）：\n${normalizedJobTitle}\n\n`
    : '';

  return `
请根据岗位信息、个人简历、模拟面试问题以及候选人的回答，生成一份完整的中文面试评价报告。

评价目标：
1. 判断候选人与岗位的整体匹配度。
2. 总结候选人的主要优势和主要风险点。
3. 对每一道题的回答给出具体反馈。
4. 给出下一步可执行的改进建议。

评价要求：
1. 评价要具体，不要只说“回答不错”或“需要加强”。
2. 每个判断都要尽量结合岗位信息、简历或具体回答。
3. 语气直接、专业、建设性，避免打击式表达。
4. 分数使用 0 到 100 的整数。
5. 只返回 JSON，不要返回 Markdown，不要使用 \`\`\`json 包裹，不要添加额外解释。

返回格式必须严格符合：
{
  "evaluation": {
    "overallScore": 80,
    "summary": "整体评价文本",
    "strengths": ["优势 1", "优势 2"],
    "risks": ["风险点 1", "风险点 2"],
    "improvementSuggestions": ["改进建议 1", "改进建议 2"],
    "questionFeedback": [
      {
        "question": "原问题文本",
        "score": 80,
        "feedback": "这道题回答得怎么样",
        "suggestion": "这道题可以如何改进"
      }
    ],
    "nextPracticeQuestions": ["建议继续练习的问题 1"]
  }
}

字段要求：
- evaluation 必须是对象。
- overallScore 必须是 0 到 100 的整数。
- summary 必须是非空字符串。
- strengths、risks、improvementSuggestions、questionFeedback、nextPracticeQuestions 都必须是数组。
- questionFeedback 的数量必须和输入的问题回答数量一致。
- questionFeedback 每一项都必须包含 question、score、feedback、suggestion。

${jobTitleContext}岗位信息：
${jobInfo}

个人简历：
${resume}

问题和回答：
${JSON.stringify(questionAnswers, null, 2)}
`;
}
