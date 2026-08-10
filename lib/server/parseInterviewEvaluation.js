/**
 * 文件职责：解析 AI 返回的最终面试评价 JSON 文本。
 *
 * 关联文件：
 * - lib/prompts/interviewEvaluation.js：这里的解析逻辑依赖该 prompt 约定的 JSON 输出格式。
 * - lib/server/interviewEvaluation.js：后续会调用这里的解析函数，把模型原始文本转成 evaluation 对象。
 * - app/api/evaluate-interview/route.js：后续会通过服务层间接拿到解析后的评价数据。
 *
 * 说明：
 * - AI 偶尔可能返回 ```json 包裹，所以这里会先清理 Markdown 代码块标记。
 * - 这个文件只负责解析和校验，不负责调用 DeepSeek，也不负责前端展示。
 */

// 去掉模型可能额外包上的 Markdown 代码块标记，尽量还原纯 JSON 字符串。
function cleanJsonText(content) {
  return content
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

// 校验字符串字段，避免前端拿到空内容。
function validateNonEmptyString(value, fieldName) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${fieldName} 必须是非空字符串。`);
  }
}

// 校验字符串数组字段，保证报告里的列表内容可以直接展示。
function validateStringArray(value, fieldName) {
  if (!Array.isArray(value)) {
    throw new Error(`${fieldName} 必须是数组。`);
  }

  value.forEach((item, index) => {
    if (typeof item !== 'string' || !item.trim()) {
      throw new Error(`${fieldName} 的第 ${index + 1} 项必须是非空字符串。`);
    }
  });
}

// 校验分数字段，统一要求 0 到 100 的整数。
function validateScore(value, fieldName) {
  if (!Number.isInteger(value) || value < 0 || value > 100) {
    throw new Error(`${fieldName} 必须是 0 到 100 的整数。`);
  }
}

// 校验逐题反馈数组，确保每道题都有分数、反馈和改进建议。
function validateQuestionFeedback(value) {
  if (!Array.isArray(value)) {
    throw new Error('questionFeedback 必须是数组。');
  }

  value.forEach((item, index) => {
    validateNonEmptyString(item?.question, `questionFeedback 第 ${index + 1} 项的 question`);
    validateScore(item?.score, `questionFeedback 第 ${index + 1} 项的 score`);
    validateNonEmptyString(item?.feedback, `questionFeedback 第 ${index + 1} 项的 feedback`);
    validateNonEmptyString(item?.suggestion, `questionFeedback 第 ${index + 1} 项的 suggestion`);
  });
}

// 兼容 { evaluation: {...} }，并集中校验最终评价对象。
function normalizeEvaluationPayload(parsed) {
  const evaluation = parsed?.evaluation;

  if (!evaluation || typeof evaluation !== 'object' || Array.isArray(evaluation)) {
    throw new Error('AI 返回 JSON 中缺少有效的 evaluation 对象。');
  }

  validateScore(evaluation.overallScore, 'overallScore');
  validateNonEmptyString(evaluation.summary, 'summary');
  validateStringArray(evaluation.strengths, 'strengths');
  validateStringArray(evaluation.risks, 'risks');
  validateStringArray(evaluation.improvementSuggestions, 'improvementSuggestions');
  validateQuestionFeedback(evaluation.questionFeedback);
  validateStringArray(evaluation.nextPracticeQuestions, 'nextPracticeQuestions');

  return evaluation;
}

// 对外暴露的解析函数：输入 AI 原始文本，输出标准化 evaluation 对象。
export function parseInterviewEvaluation(content) {
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('AI 返回内容为空，无法解析最终评价。');
  }

  const jsonText = cleanJsonText(content);
  let parsed;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('AI 返回内容不是合法 JSON。');
  }

  const evaluation = normalizeEvaluationPayload(parsed);

  // 只保留前端需要展示的字段，避免模型额外字段扩散出去。
  return {
    overallScore: evaluation.overallScore,
    summary: evaluation.summary.trim(),
    strengths: evaluation.strengths.map((item) => item.trim()),
    risks: evaluation.risks.map((item) => item.trim()),
    improvementSuggestions: evaluation.improvementSuggestions.map((item) => item.trim()),
    questionFeedback: evaluation.questionFeedback.map((item) => ({
      question: item.question.trim(),
      score: item.score,
      feedback: item.feedback.trim(),
      suggestion: item.suggestion.trim(),
    })),
    nextPracticeQuestions: evaluation.nextPracticeQuestions.map((item) => item.trim()),
  };
}
