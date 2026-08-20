/**
 * 文件职责：模拟面试主页面组件。
 *
 * 关联文件：
 * - lib/client/interviewApi.js：封装前端调用后端 API 的请求方法。
 * - lib/client/interviewHistoryStorage.js：保存和读取浏览器本地面试历史记录。
 * - lib/dev/interviewMocks.js：提供开发环境使用的本地 mock 问题和 mock 评价。
 * - app/globals.css：提供本组件使用的页面、表单、按钮和结果区样式。
 * - app/api/generate-questions/route.js：前端通过请求层调用生成问题 API。
 * - app/api/evaluate-interview/route.js：前端通过请求层调用最终评价 API。
 *
 * 说明：
 * - 这个文件只处理浏览器端交互：输入、按钮点击、loading、错误、结果展示和本地历史记录展示。
 * - 不要在这里读取 DEEPSEEK_API_KEY，API Key 只能放在服务端。
 */
'use client';

import { useEffect, useState } from 'react';
import { evaluateInterview, generateInterviewQuestions } from '../lib/client/interviewApi';
import {
  createInterviewSessionId,
  getInterviewSessions,
  saveInterviewSession,
} from '../lib/client/interviewHistoryStorage';
import {
  createMockInterviewEvaluation,
  mockInterviewQuestions,
} from '../lib/dev/interviewMocks';

const isDevelopment = process.env.NODE_ENV === 'development';

const SAMPLE_JOB_INFO = `岗位名称：AI 产品经理实习生

岗位职责：
1. 参与 AI 面试训练产品的需求分析、用户流程设计和功能验收。
2. 协助梳理岗位 JD、简历内容和面试问题之间的匹配逻辑。
3. 与前端和后端开发协作，推动 MVP 功能快速落地。
4. 参与 Prompt 调优、AI 返回结果评估和 bad case 复盘。

任职要求：
1. 对 AI 产品、Prompt Engineering 或求职面试场景有兴趣。
2. 能够拆解用户需求，写出清晰的产品文档和验收标准。
3. 具备基本技术理解能力，能和工程师沟通接口、数据结构和异常情况。
4. 有独立项目、实习经历或校园项目经验者优先。`;

const SAMPLE_RESUME = `姓名：张同学
目标岗位：AI 产品经理实习生

教育背景：
某大学 信息管理与信息系统 本科

项目经历：
AI Interview Simulator 独立项目
- 设计一个基于岗位 JD 和个人简历生成模拟面试问题的 MVP。
- 拆分前端输入、后端 API、Prompt 管理、AI 返回解析和结果展示模块。
- 使用 Next.js 和 DeepSeek API 跑通从生成问题到最终评价的核心流程。

实习经历：
互联网产品实习生
- 参与 AI 销售助手项目，整理用户需求和常见问答场景。
- 协助测试 RAG 检索效果，记录模型回答不准确的 bad case。
- 根据测试结果调整 Prompt 结构，提高回答稳定性。

技能能力：
- 产品能力：需求分析、竞品分析、流程设计、PRD 写作。
- 技术理解：JavaScript、React、Next.js、基础 API 调用。
- AI 相关：Prompt Engineering、AI 返回 JSON 结构设计、基础模型效果评估。`;

const SAMPLE_ANSWER_FOCUS = {
  岗位匹配: '求职动机、岗位理解和个人优势',
  项目经验: '项目目标、方案拆解、推进过程和结果复盘',
  技能能力: '技术理解、Prompt 调优和效果验证方法',
  协作沟通: '跨角色沟通、问题定位和推动落地',
  行为问题: '任务取舍、优先级判断和自我管理',
  风险点: '风险识别、补足计划和改进动作',
};

// 开发辅助：根据当前题目生成本地测试回答，用于快速走完整提交和评价流程。
function buildSampleAnswer(questionItem, questionIndex) {
  const focus = SAMPLE_ANSWER_FOCUS[questionItem.category] || '问题分析、行动过程和结果复盘';

  return `这是第 ${questionIndex + 1} 题的开发测试回答。针对「${questionItem.question}」，我会先结合岗位要求说明问题背景，再引用简历中的 AI Interview Simulator 或 AI 销售助手经历举例，重点说明${focus}。实际面试中我会继续补充具体指标、个人职责、协作方式和复盘思考。`;
}

function getTextSummary(text, maxLength = 48) {
  const normalizedText = String(text || '').replace(/\s+/g, ' ').trim();

  if (!normalizedText) {
    return '未填写内容';
  }

  if (normalizedText.length <= maxLength) {
    return normalizedText;
  }

  return `${normalizedText.slice(0, maxLength)}...`;
}

function formatHistoryTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '时间未知';
  }

  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatGenerationSource(generationSource) {
  if (!generationSource) {
    return '';
  }

  const questionSource = generationSource.questions === 'mock' ? 'Mock 问题' : 'AI 问题';
  const evaluationSource = generationSource.evaluation === 'mock' ? 'Mock 评价' : 'AI 评价';

  return `${questionSource} / ${evaluationSource}`;
}

// 前端主组件：负责收集输入、生成问题、提交回答，并展示最终评价。
export default function InterviewSimulator() {
  const [jobInfo, setJobInfo] = useState('');
  const [resume, setResume] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [answerErrors, setAnswerErrors] = useState({});
  const [evaluation, setEvaluation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState('');
  const [evaluationError, setEvaluationError] = useState('');
  const [historySaveStatus, setHistorySaveStatus] = useState('');
  const [historySaveMessage, setHistorySaveMessage] = useState('');
  const [historySessions, setHistorySessions] = useState([]);
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState('');
  const [questionGenerationSource, setQuestionGenerationSource] = useState('');

  // 首次进入页面时读取本地历史记录，只在浏览器端执行。
  useEffect(() => {
    setHistorySessions(getInterviewSessions());
  }, []);

  // 开发辅助：填入固定示例输入，并清空上一轮生成结果，方便反复测试主流程。
  const handleFillSampleInputs = () => {
    setJobInfo(SAMPLE_JOB_INFO);
    setResume(SAMPLE_RESUME);
    setQuestions([]);
    setAnswers({});
    setSubmittedAnswers({});
    setAnswerErrors({});
    setEvaluation(null);
    setError('');
    setEvaluationError('');
    setHistorySaveStatus('');
    setHistorySaveMessage('');
    setQuestionGenerationSource('');
  };

  // 开发辅助：为当前问题列表填入测试回答，但保留逐题手动提交动作。
  const handleFillSampleAnswers = () => {
    const sampleAnswers = questions.reduce((nextAnswers, questionItem, questionIndex) => ({
      ...nextAnswers,
      [questionIndex]: buildSampleAnswer(questionItem, questionIndex),
    }), {});

    setAnswers(sampleAnswers);
    setSubmittedAnswers({});
    setAnswerErrors({});
    setEvaluation(null);
    setEvaluationError('');
    setHistorySaveStatus('');
    setHistorySaveMessage('');
  };

  // 根据已提交回答计算答题进度，只统计当前问题列表里的题目。
  const totalQuestionCount = questions.length;
  const submittedAnswerCount = questions.filter((_, index) => submittedAnswers[index]).length;

  // 整理提交给 AI 批改接口的数据结构：每一项都包含问题和对应回答。
  const submittedQuestionAnswers = questions
    .map((item, index) => ({
      category: item.category,
      question: item.question,
      reason: item.reason,
      answer: submittedAnswers[index] || '',
    }))
    .filter((item) => item.answer);
  const isReadyForEvaluation =
    totalQuestionCount > 0 && submittedQuestionAnswers.length === totalQuestionCount;
  const selectedHistorySession = historySessions.find(
    (session) => session.id === selectedHistorySessionId
  );
  const selectedHistoryScore = selectedHistorySession?.evaluation?.overallScore;
  const selectedHistorySourceLabel = formatGenerationSource(
    selectedHistorySession?.generationSource
  );

  // 按问题下标保存用户回答，提交整场评价时会使用这些回答。
  const handleAnswerChange = (questionIndex, answerText) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionIndex]: answerText,
    }));

    // 用户开始修改回答后，清掉该题之前的局部错误、已提交状态和旧评价。
    setAnswerErrors((currentErrors) => ({
      ...currentErrors,
      [questionIndex]: '',
    }));
    setSubmittedAnswers((currentSubmittedAnswers) => ({
      ...currentSubmittedAnswers,
      [questionIndex]: '',
    }));
    setEvaluation(null);
    setEvaluationError('');
    setHistorySaveStatus('');
    setHistorySaveMessage('');
  };

  // 统一处理评价展示和历史保存，保证真实 AI 和 Mock 评价复用同一条链路。
  const handleEvaluationGenerated = (generatedEvaluation, evaluationGenerationSource) => {
    setEvaluation(generatedEvaluation);

    try {
      const savedAt = new Date().toISOString();

      const savedSession = saveInterviewSession({
        id: createInterviewSessionId(),
        version: 1,
        source: 'localStorage',
        generationSource: {
          questions: questionGenerationSource || 'ai',
          evaluation: evaluationGenerationSource,
        },
        jobInfo,
        resume,
        questions,
        answers: submittedAnswers,
        questionAnswers: submittedQuestionAnswers,
        evaluation: generatedEvaluation,
        createdAt: savedAt,
        updatedAt: savedAt,
      });

      setHistorySessions(getInterviewSessions());
      setSelectedHistorySessionId(savedSession.id);
      setHistorySaveStatus('success');
      setHistorySaveMessage('已保存到本地历史记录。');
    } catch {
      setHistorySaveStatus('error');
      setHistorySaveMessage('最终评价已生成，但本地保存失败。');
    }
  };

  // 单题提交：在前端记录已确认的回答，最终评价接口只使用已提交回答。
  const handleSubmitAnswer = (questionIndex) => {
    const answerText = answers[questionIndex]?.trim();

    if (!answerText) {
      setAnswerErrors((currentErrors) => ({
        ...currentErrors,
        [questionIndex]: '请先填写这道题的回答。',
      }));
      return;
    }

    setAnswerErrors((currentErrors) => ({
      ...currentErrors,
      [questionIndex]: '',
    }));
    setSubmittedAnswers((currentSubmittedAnswers) => ({
      ...currentSubmittedAnswers,
      [questionIndex]: answerText,
    }));
    setEvaluation(null);
    setEvaluationError('');
    setHistorySaveStatus('');
    setHistorySaveMessage('');
  };

  // 点击按钮时先做前端校验，再调用 client API 获取问题数组。
  const handleGenerateQuestions = async () => {
    if (!jobInfo.trim() || !resume.trim()) {
      setError('请先填写岗位信息和个人简历。');
      setQuestions([]);
      setAnswers({});
      setSubmittedAnswers({});
      setAnswerErrors({});
      setEvaluation(null);
      setEvaluationError('');
      setHistorySaveStatus('');
      setHistorySaveMessage('');
      setQuestionGenerationSource('');
      return;
    }

    setError('');
    setQuestions([]);
    setAnswers({});
    setSubmittedAnswers({});
    setAnswerErrors({});
    setEvaluation(null);
    setEvaluationError('');
    setHistorySaveStatus('');
    setHistorySaveMessage('');
    setQuestionGenerationSource('');
    setIsLoading(true);

    try {
      const generatedQuestions = await generateInterviewQuestions({ jobInfo, resume });
      setQuestions(generatedQuestions);
      setQuestionGenerationSource('ai');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 开发辅助：使用本地固定问题快速进入答题流程，不调用后端 API。
  const handleUseMockQuestions = () => {
    if (!jobInfo.trim() || !resume.trim()) {
      setError('请先填写岗位信息和个人简历。');
      setQuestions([]);
      setAnswers({});
      setSubmittedAnswers({});
      setAnswerErrors({});
      setEvaluation(null);
      setEvaluationError('');
      setHistorySaveStatus('');
      setHistorySaveMessage('');
      setQuestionGenerationSource('');
      return;
    }

    setError('');
    setQuestions(mockInterviewQuestions);
    setAnswers({});
    setSubmittedAnswers({});
    setAnswerErrors({});
    setEvaluation(null);
    setEvaluationError('');
    setHistorySaveStatus('');
    setHistorySaveMessage('');
    setQuestionGenerationSource('mock');
  };

  // 所有题目提交后，调用最终评价 API 生成整体报告和逐题反馈。
  const handleEvaluateInterview = async () => {
    if (!isReadyForEvaluation) {
      setEvaluationError('请先提交所有题目的回答。');
      return;
    }

    setEvaluation(null);
    setEvaluationError('');
    setHistorySaveStatus('');
    setHistorySaveMessage('');
    setIsEvaluating(true);

    try {
      const generatedEvaluation = await evaluateInterview({
        jobInfo,
        resume,
        questionAnswers: submittedQuestionAnswers,
      });
      handleEvaluationGenerated(generatedEvaluation, 'ai');
    } catch (error) {
      setEvaluationError(error.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  // 开发辅助：使用当前已提交问答生成本地 mock 评价，并复用真实评价后的保存链路。
  const handleUseMockEvaluation = () => {
    if (!isReadyForEvaluation) {
      setEvaluationError('请先提交所有题目的回答。');
      return;
    }

    setEvaluation(null);
    setEvaluationError('');
    setHistorySaveStatus('');
    setHistorySaveMessage('');

    const generatedEvaluation = createMockInterviewEvaluation(submittedQuestionAnswers);
    handleEvaluationGenerated(generatedEvaluation, 'mock');
  };

  return (
    <main className="page">
      {/* 输入区：收集岗位信息和个人简历。 */}
      <section className="panel">
        <h1>AI 模拟面试</h1>
        <p className="subtitle">
          粘贴岗位信息和个人简历，生成模拟问题；回答并提交所有题目后，可以获得一份最终面试评价。
        </p>

        {isDevelopment && (
          <div className="dev-helper">
            <div>
              <p className="dev-helper-title">开发辅助</p>
              <p className="dev-helper-description">本地区域只在开发环境显示，用来快速填入固定测试输入。</p>
            </div>
            <button type="button" className="secondary-button" onClick={handleFillSampleInputs}>
              填入示例 JD/简历
            </button>
          </div>
        )}

        <div className="field">
          <label htmlFor="job">岗位信息</label>
          <textarea
            id="job"
            value={jobInfo}
            onChange={(event) => setJobInfo(event.target.value)}
            placeholder="粘贴岗位 JD，例如岗位职责、任职要求、技术栈等"
          />
        </div>

        <div className="field">
          <label htmlFor="resume">个人简历</label>
          <textarea
            id="resume"
            value={resume}
            onChange={(event) => setResume(event.target.value)}
            placeholder="粘贴简历内容，例如工作经历、项目经历、技能栈等"
          />
        </div>

        <div className="button-row">
          <button type="button" onClick={handleGenerateQuestions} disabled={isLoading}>
            {isLoading ? '正在生成问题...' : 'AI 生成面试问题'}
          </button>
          {isDevelopment && (
            <button
              type="button"
              className="secondary-button"
              onClick={handleUseMockQuestions}
              disabled={isLoading}
            >
              使用 Mock 问题
            </button>
          )}
        </div>

        {error && <p className="error-message">{error}</p>}
      </section>

      {/* 结果区：展示空状态、加载状态或结构化问题列表。 */}
      <section className="panel preview">
        <div className="preview-header">
          <h2>模拟问题</h2>
          {totalQuestionCount > 0 && (
            <div className="preview-actions">
              <span className="answer-progress">
                已提交 {submittedAnswerCount} / {totalQuestionCount}
              </span>
              {isDevelopment && (
                <button
                  type="button"
                  className="secondary-button compact-button"
                  onClick={handleFillSampleAnswers}
                >
                  填入测试回答
                </button>
              )}
            </div>
          )}
        </div>
        {isLoading && <p className="empty-state">DeepSeek 正在生成问题，请稍等。</p>}
        {!isLoading && questions.length === 0 && (
          <p className="empty-state">填写岗位信息和个人简历后，点击按钮生成面试问题。</p>
        )}
        {!isLoading && questions.length > 0 && (
          <>
            <ul className="question-list">
              {questions.map((item, index) => (
                <li className="question-item" key={`${item.category}-${item.question}`}>
                  <p className="category">
                    {index + 1}. {item.category}
                  </p>
                  <p className="question">{item.question}</p>
                  <p className="reason">{item.reason}</p>

                  {/* 回答输入框：用户可以逐题修改和提交回答。 */}
                  <div className="answer-field">
                    <label htmlFor={`answer-${index}`}>你的回答</label>
                    <textarea
                      id={`answer-${index}`}
                      value={answers[index] || ''}
                      onChange={(event) => handleAnswerChange(index, event.target.value)}
                      placeholder="输入你的回答，提交后会用于生成最终评价"
                    />

                    <div className="answer-actions">
                      <button type="button" onClick={() => handleSubmitAnswer(index)}>
                        提交本题回答
                      </button>
                      {submittedAnswers[index] && <span className="answer-status">已提交</span>}
                    </div>

                    {answerErrors[index] && (
                      <p className="answer-error">{answerErrors[index]}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* 评价准备区：所有回答提交后，触发最终评价 API。 */}
            <div className="evaluation-ready-panel">
              <p>
                {isReadyForEvaluation
                  ? '所有回答已提交，评价数据已经准备好。'
                  : '提交所有题目的回答后，就可以准备生成最终评价。'}
              </p>
              <div className="button-row">
                <button
                  type="button"
                  disabled={!isReadyForEvaluation || isEvaluating}
                  onClick={handleEvaluateInterview}
                >
                  {isEvaluating ? '正在生成最终评价...' : 'AI 生成最终评价'}
                </button>
                {isDevelopment && (
                  <button
                    type="button"
                    className="secondary-button"
                    disabled={!isReadyForEvaluation || isEvaluating}
                    onClick={handleUseMockEvaluation}
                  >
                    使用 Mock 评价
                  </button>
                )}
              </div>
              {evaluationError && <p className="answer-error">{evaluationError}</p>}
            </div>
          </>
        )}
      </section>

      {/* 最终评价区：展示整体评分、总结、列表建议和逐题反馈。 */}
      {evaluation && (
        <section className="panel evaluation-panel">
          <div className="evaluation-header">
            <h2>最终评价</h2>
            <span className="evaluation-score">{evaluation.overallScore} / 100</span>
          </div>

          <p className="evaluation-summary">{evaluation.summary}</p>
          {historySaveMessage && (
            <p className={`history-save-status ${historySaveStatus}`}>
              {historySaveMessage}
            </p>
          )}

          <div className="evaluation-grid">
            <div>
              <h3>主要优势</h3>
              <ul>
                {evaluation.strengths.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3>风险点</h3>
              <ul>
                {evaluation.risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="evaluation-block">
            <h3>改进建议</h3>
            <ul>
              {evaluation.improvementSuggestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="evaluation-block">
            <h3>逐题反馈</h3>
            <ul className="feedback-list">
              {evaluation.questionFeedback.map((item, index) => (
                <li key={`${item.question}-${index}`}>
                  <p className="category">
                    第 {index + 1} 题｜{item.score} / 100
                  </p>
                  <p className="question">{item.question}</p>
                  <p className="reason">{item.feedback}</p>
                  <p className="reason">改进建议：{item.suggestion}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="evaluation-block">
            <h3>后续练习题</h3>
            <ul>
              {evaluation.nextPracticeQuestions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 历史记录区：展示最近保存的本地面试记录，并支持查看详情。 */}
      <section className="panel history-panel">
        <div className="preview-header">
          <h2>历史记录</h2>
          {historySessions.length > 0 && (
            <span className="answer-progress">最近 {historySessions.length} 条</span>
          )}
        </div>

        {historySessions.length === 0 && (
          <p className="empty-state">完成一次最终评价后，这里会显示本地历史记录。</p>
        )}

        {historySessions.length > 0 && (
          <div className="history-layout">
            <ul className="history-list">
              {historySessions.map((session) => (
                <li key={session.id}>
                  <button
                    type="button"
                    className={`history-item-button ${
                      selectedHistorySessionId === session.id ? 'active' : ''
                    }`}
                    onClick={() => setSelectedHistorySessionId(session.id)}
                  >
                    <span className="history-item-main">
                      <span className="history-title">
                        {getTextSummary(session.jobInfo, 36)}
                      </span>
                      <span className="history-meta">
                        {formatHistoryTime(session.createdAt)}
                        {typeof session.evaluation?.overallScore === 'number'
                          ? ` ｜ ${session.evaluation.overallScore} / 100`
                          : ''}
                      </span>
                      {formatGenerationSource(session.generationSource) && (
                        <span className="history-source">
                          {formatGenerationSource(session.generationSource)}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <div className="history-detail">
              {!selectedHistorySession && (
                <p className="empty-state">选择一条历史记录查看详情。</p>
              )}

              {selectedHistorySession && (
                <>
                  <div className="history-detail-header">
                    <div>
                      <p className="category">
                        {formatHistoryTime(selectedHistorySession.createdAt)}
                      </p>
                      <h3>{getTextSummary(selectedHistorySession.jobInfo, 56)}</h3>
                      {selectedHistorySourceLabel && (
                        <p className="history-source detail-source">
                          {selectedHistorySourceLabel}
                        </p>
                      )}
                    </div>
                    {typeof selectedHistoryScore === 'number' && (
                      <span className="evaluation-score">
                        {selectedHistoryScore} / 100
                      </span>
                    )}
                  </div>

                  <div className="history-detail-block">
                    <h4>岗位信息摘要</h4>
                    <p>{getTextSummary(selectedHistorySession.jobInfo, 120)}</p>
                  </div>

                  <div className="history-detail-block">
                    <h4>简历摘要</h4>
                    <p>{getTextSummary(selectedHistorySession.resume, 120)}</p>
                  </div>

                  {selectedHistorySession.evaluation?.summary && (
                    <div className="history-detail-block">
                      <h4>整体评价</h4>
                      <p>{selectedHistorySession.evaluation.summary}</p>
                    </div>
                  )}

                  <div className="history-detail-block">
                    <h4>问答记录</h4>
                    <ul className="history-qa-list">
                      {(selectedHistorySession.questionAnswers || []).map((item, index) => (
                        <li key={`${selectedHistorySession.id}-${item.question}-${index}`}>
                          <p className="category">
                            第 {index + 1} 题｜{item.category}
                          </p>
                          <p className="question">{item.question}</p>
                          <p className="reason">回答：{item.answer}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
