/**
 * 文件职责：展示浏览器本地保存的最近面试历史记录和详情。
 *
 * 关联文件：
 * - app/interview/history/page.js：受保护的历史记录页面挂载本组件。
 * - lib/client/interviewHistoryStorage.js：读取浏览器 localStorage 中的历史记录。
 * - app/globals.css：提供历史记录列表和详情样式。
 *
 * 说明：
 * - 本组件只在浏览器端读取 localStorage，不接数据库，也不做云端同步。
 * - 不改变本地历史记录数据结构，只按已有字段做只读展示。
 */
'use client';

import { useEffect, useState } from 'react';
import { getInterviewSessions } from '../lib/client/interviewHistoryStorage';

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

function getHistorySessionTitle(session, maxLength = 48) {
  const normalizedJobTitle = String(session?.jobTitle || '').replace(/\s+/g, ' ').trim();

  if (normalizedJobTitle) {
    return normalizedJobTitle.length <= maxLength
      ? normalizedJobTitle
      : `${normalizedJobTitle.slice(0, maxLength)}...`;
  }

  const normalizedJobInfo = String(session?.jobInfo || '').replace(/\s+/g, ' ').trim();

  if (!normalizedJobInfo) {
    return '未命名岗位';
  }

  return normalizedJobInfo.length <= maxLength
    ? normalizedJobInfo
    : `${normalizedJobInfo.slice(0, maxLength)}...`;
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

// 历史记录只在客户端读取，避免服务端渲染阶段访问 window 或 localStorage。
export default function InterviewHistoryPanel() {
  const [historySessions, setHistorySessions] = useState([]);
  const [selectedHistorySessionId, setSelectedHistorySessionId] = useState('');

  useEffect(() => {
    const sessions = getInterviewSessions();

    setHistorySessions(sessions);
    setSelectedHistorySessionId(sessions[0]?.id || '');
  }, []);

  const selectedHistorySession = historySessions.find(
    (session) => session.id === selectedHistorySessionId
  );
  const selectedHistoryScore = selectedHistorySession?.evaluation?.overallScore;
  const selectedHistorySourceLabel = formatGenerationSource(
    selectedHistorySession?.generationSource
  );

  return (
    <section className="panel history-panel">
      <div className="preview-header">
        <h2>历史记录</h2>
        {historySessions.length > 0 && (
          <span className="answer-progress">最近 {historySessions.length} 条</span>
        )}
      </div>

      {historySessions.length === 0 && (
        <p className="empty-state">生成最终评价后，这里会保留最近的本地历史记录。</p>
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
                      {getHistorySessionTitle(session, 36)}
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
              <p className="empty-state">选择一条本地历史记录查看详情。</p>
            )}

            {selectedHistorySession && (
              <>
                <div className="history-detail-header">
                  <div>
                    <p className="category">
                      {formatHistoryTime(selectedHistorySession.createdAt)}
                    </p>
                    <h3>{getHistorySessionTitle(selectedHistorySession, 56)}</h3>
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
  );
}
