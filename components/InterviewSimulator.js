/**
 * 文件职责：模拟面试主页面组件。
 *
 * 关联文件：
 * - lib/client/interviewApi.js：封装前端调用后端 API 的请求方法。
 * - app/globals.css：提供本组件使用的页面、表单、按钮和结果区样式。
 * - app/api/generate-questions/route.js：前端最终会请求到生成问题 API。
 * - app/api/evaluate-interview/route.js：前端最终会请求到最终评价 API。
 *
 * 说明：
 * - 这个文件只处理浏览器端交互：输入、按钮点击、loading、错误和结果展示。
 * - 不要在这里读取 DEEPSEEK_API_KEY，API Key 只能放在服务端。
 */
'use client';

import { useState } from 'react';
import { evaluateInterview, generateInterviewQuestions } from '../lib/client/interviewApi';

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

  // 按问题下标保存用户回答，下一步会把这些回答提交给评价接口。
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
  };

  // 单题提交：当前只在前端记录提交状态，后续再接入单题评价或最终评价接口。
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
      return;
    }

    setError('');
    setQuestions([]);
    setAnswers({});
    setSubmittedAnswers({});
    setAnswerErrors({});
    setEvaluation(null);
    setEvaluationError('');
    setIsLoading(true);

    try {
      const generatedQuestions = await generateInterviewQuestions({ jobInfo, resume });
      setQuestions(generatedQuestions);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 所有题目提交后，调用最终评价 API 生成整体报告和逐题反馈。
  const handleEvaluateInterview = async () => {
    if (!isReadyForEvaluation) {
      setEvaluationError('请先提交所有题目的回答。');
      return;
    }

    setEvaluation(null);
    setEvaluationError('');
    setIsEvaluating(true);

    try {
      const generatedEvaluation = await evaluateInterview({
        jobInfo,
        resume,
        questionAnswers: submittedQuestionAnswers,
      });
      setEvaluation(generatedEvaluation);
    } catch (error) {
      setEvaluationError(error.message);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <main className="page">
      {/* 输入区：收集岗位信息和个人简历。 */}
      <section className="panel">
        <h1>AI 模拟面试</h1>
        <p className="subtitle">
          先用岗位信息和个人简历跑通面试准备流程。当前版本会调用 DeepSeek 生成第一组面试问题。
        </p>

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

        <button type="button" onClick={handleGenerateQuestions} disabled={isLoading}>
          {isLoading ? '正在生成问题...' : '生成面试问题'}
        </button>

        {error && <p className="error-message">{error}</p>}
      </section>

      {/* 结果区：展示空状态、加载状态或结构化问题列表。 */}
      <section className="panel preview">
        <div className="preview-header">
          <h2>模拟问题</h2>
          {totalQuestionCount > 0 && (
            <span className="answer-progress">
              已提交 {submittedAnswerCount} / {totalQuestionCount}
            </span>
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

                  {/* 回答输入框：当前阶段支持单题提交，但暂时不提交到后端。 */}
                  <div className="answer-field">
                    <label htmlFor={`answer-${index}`}>你的回答</label>
                    <textarea
                      id={`answer-${index}`}
                      value={answers[index] || ''}
                      onChange={(event) => handleAnswerChange(index, event.target.value)}
                      placeholder="先输入你的回答，下一步会用于生成最终评价"
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
              <button
                type="button"
                disabled={!isReadyForEvaluation || isEvaluating}
                onClick={handleEvaluateInterview}
              >
                {isEvaluating ? '正在生成最终评价...' : '生成最终评价'}
              </button>
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
    </main>
  );
}
