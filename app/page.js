'use client';

import { useState } from 'react';

export default function Home() {
  // 保存用户输入、AI 返回内容、加载状态，以及错误提示。
  const [jobInfo, setJobInfo] = useState('');
  const [resume, setResume] = useState('');
  const [aiResult, setAiResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 点击按钮时先检查输入，再请求后端 API 生成面试问题。
  const handleGenerateQuestions = async () => {
    if (!jobInfo.trim() || !resume.trim()) {
      setError('请先填写岗位信息和个人简历。');
      setAiResult('');
      return;
    }

    setError('');
    setAiResult('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobInfo,
          resume,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成问题失败，请稍后重试。');
      }

      setAiResult(data.content || 'AI 没有返回内容。');
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

      {/* 结果区：展示空状态、加载状态或 AI 返回内容。 */}
      <section className="panel preview">
        <h2>模拟问题</h2>
        {isLoading && <p className="empty-state">DeepSeek 正在生成问题，请稍等。</p>}
        {!isLoading && !aiResult && (
          <p className="empty-state">填写岗位信息和个人简历后，点击按钮生成面试问题。</p>
        )}
        {!isLoading && aiResult && <pre className="ai-result">{aiResult}</pre>}
      </section>
    </main>
  );
}
