/**
 * 文件职责：模拟面试主页面组件。
 *
 * 关联文件：
 * - lib/client/interviewApi.js：封装前端调用后端 API 的请求方法。
 * - app/globals.css：提供本组件使用的页面、表单、按钮和结果区样式。
 * - app/api/generate-questions/route.js：前端最终会请求到这个后端 API。
 *
 * 说明：
 * - 这个文件只处理浏览器端交互：输入、按钮点击、loading、错误和结果展示。
 * - 不要在这里读取 DEEPSEEK_API_KEY，API Key 只能放在服务端。
 */
'use client';

import { useState } from 'react';
import { generateInterviewQuestions } from '../lib/client/interviewApi';

// 前端主组件：负责收集输入、触发生成、展示加载/错误/结构化问题列表和用户回答。
export default function InterviewSimulator() {
  const [jobInfo, setJobInfo] = useState('');
  const [resume, setResume] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 按问题下标保存用户回答，下一步会把这些回答提交给评价接口。
  const handleAnswerChange = (questionIndex, answerText) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionIndex]: answerText,
    }));
  };

  // 点击按钮时先做前端校验，再调用 client API 获取问题数组。
  const handleGenerateQuestions = async () => {
    if (!jobInfo.trim() || !resume.trim()) {
      setError('请先填写岗位信息和个人简历。');
      setQuestions([]);
      setAnswers({});
      return;
    }

    setError('');
    setQuestions([]);
    setAnswers({});
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
        <h2>模拟问题</h2>
        {isLoading && <p className="empty-state">DeepSeek 正在生成问题，请稍等。</p>}
        {!isLoading && questions.length === 0 && (
          <p className="empty-state">填写岗位信息和个人简历后，点击按钮生成面试问题。</p>
        )}
        {!isLoading && questions.length > 0 && (
          <ul className="question-list">
            {questions.map((item, index) => (
              <li className="question-item" key={`${item.category}-${item.question}`}>
                <p className="category">
                  {index + 1}. {item.category}
                </p>
                <p className="question">{item.question}</p>
                <p className="reason">{item.reason}</p>

                {/* 回答输入框：当前阶段只保存到前端状态，暂时不提交后端。 */}
                <div className="answer-field">
                  <label htmlFor={`answer-${index}`}>你的回答</label>
                  <textarea
                    id={`answer-${index}`}
                    value={answers[index] || ''}
                    onChange={(event) => handleAnswerChange(index, event.target.value)}
                    placeholder="先输入你的回答，下一步会用于生成最终评价"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
