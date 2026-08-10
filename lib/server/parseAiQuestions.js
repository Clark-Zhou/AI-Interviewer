/**
 * 文件职责：解析 AI 返回的面试问题 JSON 文本。
 *
 * 关联文件：
 * - lib/server/deepseek.js：后续会调用这里的解析函数，把模型原始文本转成 questions 数组。
 * - lib/prompts/interviewQuestions.js：这里的解析逻辑依赖 prompt 约定的 JSON 输出格式。
 * - app/api/generate-questions/route.js：通过 DeepSeek 服务层间接拿到解析后的问题数据。
 *
 * 说明：
 * - AI 偶尔可能返回 ```json 包裹或直接返回数组，所以这里做一点兼容处理。
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

// 兼容两种常见返回：{ questions: [...] } 或直接 [...]。
function normalizeQuestionsPayload(parsed) {
  if (Array.isArray(parsed)) {
    return parsed;
  }

  if (Array.isArray(parsed?.questions)) {
    return parsed.questions;
  }

  throw new Error('AI 返回 JSON 中缺少 questions 数组。');
}

// 校验单个问题对象，避免前端拿到缺字段的数据。
function validateQuestionItem(item, index) {
  const requiredFields = ['category', 'question', 'reason'];

  for (const field of requiredFields) {
    if (typeof item?.[field] !== 'string' || !item[field].trim()) {
      throw new Error(`第 ${index + 1} 个问题缺少有效的 ${field} 字段。`);
    }
  }
}

// 对外暴露的解析函数：输入 AI 原始文本，输出标准化 questions 数组。
export function parseAiQuestions(content) {
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('AI 返回内容为空，无法解析问题。');
  }

  const jsonText = cleanJsonText(content);
  let parsed;

  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error('AI 返回内容不是合法 JSON。');
  }

  const questions = normalizeQuestionsPayload(parsed);

  if (questions.length === 0) {
    throw new Error('AI 返回的问题列表为空。');
  }

  questions.forEach(validateQuestionItem);

  // 只保留前端真正需要的字段，避免把模型额外字段扩散出去。
  return questions.map((item) => ({
    category: item.category.trim(),
    question: item.question.trim(),
    reason: item.reason.trim(),
  }));
}
