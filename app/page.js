'use client';

import { useState } from 'react';

// 当前阶段先使用固定示例问题，后续会替换成 AI 接口返回的数据。
const questions = [
  {
    category: '岗位匹配',
    question: '请结合你的经历，说明你为什么适合这个岗位？',
    reason: '用于判断你的背景和岗位要求是否匹配。',
  },
  {
    category: '项目经验',
    question: '请介绍一个最能体现你相关能力的项目。',
    reason: '用于了解你的真实参与度、贡献和解决问题的方式。',
  },
  {
    category: '技能能力',
    question: '岗位要求里的关键技能，你最熟悉哪一项？请举例说明。',
    reason: '用于验证技能是否能落到实际经验中。',
  },
  {
    category: '成长空间',
    question: '对照这个岗位，你觉得自己还需要补强什么？',
    reason: '用于观察你的自我认知和准备方向。',
  },
];

export default function Home() {
  // 保存用户输入、问题列表展示状态，以及表单错误提示。
  const [jobInfo, setJobInfo] = useState('');
  const [resume, setResume] = useState('');
  const [showQuestions, setShowQuestions] = useState(false);
  const [error, setError] = useState('');

  // 点击按钮时先检查两个输入框，再决定是否展示示例问题。
  const handleGenerateQuestions = () => {
    if (!jobInfo.trim() || !resume.trim()) {
      setError('请先填写岗位信息和个人简历。');
      setShowQuestions(false);
      return;
    }

    setError('');
    setShowQuestions(true);
  };

  return (
    <main className="page">
      {/* 输入区：收集岗位信息和个人简历。 */}
      <section className="panel">
        <h1>AI 模拟面试</h1>
        <p className="subtitle">
          先用岗位信息和个人简历跑通面试准备流程。当前版本展示示例问题，下一步再接入 AI 生成。
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

        <button type="button" onClick={handleGenerateQuestions}>
          生成示例问题
        </button>

        {error && <p className="error-message">{error}</p>}
      </section>

      {/* 结果区：根据按钮点击状态展示空状态或问题列表。 */}
      <section className="panel preview">
        <h2>模拟问题</h2>
        {showQuestions ? (
          <ul className="question-list">
            {questions.map((item, index) => (
              <li className="question-item" key={item.question}>
                <p className="category">
                  {index + 1}. {item.category}
                </p>
                <p className="question">{item.question}</p>
                <p className="reason">{item.reason}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">填写岗位信息和个人简历后，点击按钮生成示例问题。</p>
        )}
      </section>
    </main>
  );
}
