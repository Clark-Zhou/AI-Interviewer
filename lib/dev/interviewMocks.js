/**
 * 文件职责：开发环境本地 mock 面试数据。
 *
 * 关联文件：
 * - components/InterviewSimulator.js：开发环境按钮会读取这里的 mock 问题和 mock 评价。
 * - docs/DEVELOPMENT_TESTING.md：记录 mock 快速流程的手动测试路径。
 *
 * 说明：
 * - 这里只提供本地固定数据，不调用后端 API，也不读取任何 API Key。
 * - mock 数据结构应保持和真实 API 解析后的前端数据结构一致。
 */

export const mockInterviewQuestions = [
  {
    category: '岗位匹配',
    question: '请结合你的经历说明，为什么你适合这个 AI 产品经理实习生岗位？',
    reason: '考察候选人是否能把岗位要求、个人经历和求职动机连接起来。',
  },
  {
    category: '项目经验',
    question: '你在 AI Interview Simulator 项目中具体负责了哪些产品和技术拆解工作？',
    reason: '考察候选人是否真正参与项目，并能清晰说明自己的贡献。',
  },
  {
    category: '技能能力',
    question: '如果 AI 生成的问题质量不稳定，你会如何定位问题并优化 Prompt？',
    reason: '考察候选人对 Prompt 调优、bad case 复盘和效果验证的理解。',
  },
  {
    category: '协作沟通',
    question: '当工程实现和产品预期不一致时，你会如何推动问题解决？',
    reason: '考察候选人的跨角色沟通方式和推进落地能力。',
  },
  {
    category: '行为问题',
    question: '请举例说明你如何在时间有限时判断任务优先级。',
    reason: '考察候选人的取舍能力、目标意识和自我管理方式。',
  },
  {
    category: '风险点',
    question: '你觉得自己距离胜任这个岗位还有哪些短板？准备如何补足？',
    reason: '考察候选人是否有自我认知，以及是否能提出可执行的改进计划。',
  },
];

// 生成固定结构的 mock 评价，问题字段来自当前已提交问答，便于验证展示和历史保存链路。
export function createMockInterviewEvaluation(questionAnswers) {
  return {
    overallScore: 82,
    summary:
      '这是开发环境生成的 Mock 评价。整体来看，回答能够围绕岗位要求展开，并结合项目经历说明个人能力；后续可以继续补充更具体的指标、协作细节和结果复盘。',
    strengths: [
      '能够把岗位职责和个人项目经历联系起来。',
      '回答结构比较清晰，能覆盖背景、行动和结果。',
      '对 Prompt 调优、bad case 复盘和产品验证有基础理解。',
    ],
    risks: [
      '部分回答仍偏概括，缺少具体量化结果。',
      '协作推进案例可以补充更多冲突处理和决策依据。',
    ],
    improvementSuggestions: [
      '每道题至少补充一个具体项目细节或指标。',
      '回答行为问题时优先使用 STAR 结构，避免只讲观点。',
      '准备 2 到 3 个可复用的项目复盘案例，提高临场稳定性。',
    ],
    questionFeedback: questionAnswers.map((item, index) => ({
      question: item.question,
      score: Math.max(72, 88 - index * 2),
      feedback: `Mock 反馈：这道题已经覆盖了「${item.category}」的核心方向，回答内容可以支撑基础面试判断。`,
      suggestion: '继续补充更具体的行动步骤、个人职责和结果证据。',
    })),
    nextPracticeQuestions: [
      '请用 1 分钟说明你最有代表性的 AI 项目经历。',
      '如果模型输出不符合预期，你会如何设计验证和迭代流程？',
      '请举例说明一次你推动跨角色协作落地的经历。',
    ],
  };
}
