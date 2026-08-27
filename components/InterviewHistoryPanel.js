/**
 * 文件职责：展示浏览器本地保存的最近面试历史记录和详情。
 *
 * 关联文件：
 * - app/interview/history/page.js：受保护的历史记录页面挂载本组件。
 * - lib/client/interviewHistoryStorage.js：读取、删除和清空浏览器 localStorage 中的历史记录。
 * - app/globals.css：提供历史记录列表和详情样式。
 *
 * 说明：
 * - 本组件只在浏览器端读取 localStorage，不接数据库，也不做云端同步。
 * - 删除和清空只作用于当前浏览器 localStorage，不接云端同步。
 */
'use client';

import { useEffect, useState } from 'react';
import {
  clearInterviewSessions,
  deleteInterviewSession,
  getInterviewSessions,
} from '../lib/client/interviewHistoryStorage';

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
  const [isHistoryListCollapsed, setIsHistoryListCollapsed] = useState(false);
  const [historyActionMessage, setHistoryActionMessage] = useState('');

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

  const handleDeleteHistorySession = (session) => {
    const sessionTitle = getHistorySessionTitle(session, 36);

    if (!window.confirm(`确定删除「${sessionTitle}」这条本地历史记录吗？此操作不会影响其他记录。`)) {
      return;
    }

    try {
      const nextSessions = deleteInterviewSession(session.id);
      setHistorySessions(nextSessions);

      if (session.id === selectedHistorySessionId) {
        setSelectedHistorySessionId(nextSessions[0]?.id || '');
      } else if (!nextSessions.some((item) => item.id === selectedHistorySessionId)) {
        setSelectedHistorySessionId(nextSessions[0]?.id || '');
      }

      setHistoryActionMessage('已删除这条本地历史记录。');
    } catch {
      setHistoryActionMessage('删除失败，请确认浏览器允许访问 localStorage 后重试。');
    }
  };

  const handleClearHistorySessions = () => {
    if (!window.confirm('确定清空全部本地历史记录吗？此操作无法撤销。')) {
      return;
    }

    try {
      const nextSessions = clearInterviewSessions();
      setHistorySessions(nextSessions);
      setSelectedHistorySessionId('');
      setHistoryActionMessage('已清空全部本地历史记录。');
    } catch {
      setHistoryActionMessage('清空失败，请确认浏览器允许访问 localStorage 后重试。');
    }
  };

  return (
    <section className="panel history-panel">
      <div className="preview-header">
        <h2>历史记录</h2>
        {historySessions.length > 0 && (
          <div className="history-panel-actions">
            <span className="answer-progress">最近 {historySessions.length} 条</span>
            <button
              type="button"
              className="secondary-button compact-button"
              onClick={() => setIsHistoryListCollapsed((currentValue) => !currentValue)}
            >
              {isHistoryListCollapsed ? '展开左栏' : '收起左栏'}
            </button>
            <button
              type="button"
              className="danger-button compact-button"
              onClick={handleClearHistorySessions}
            >
              清空全部
            </button>
          </div>
        )}
      </div>

      {historyActionMessage && (
        <p className="history-action-message">{historyActionMessage}</p>
      )}

      {historySessions.length === 0 && (
        <p className="empty-state">生成最终评价后，这里会保留最近的本地历史记录。</p>
      )}

      {historySessions.length > 0 && (
        <div className={`history-layout ${isHistoryListCollapsed ? 'collapsed' : ''}`}>
          {!isHistoryListCollapsed && (
            <ul className="history-list">
              {historySessions.map((session) => (
                <li className="history-item-row" key={session.id}>
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
                    </span>
                  </button>
                  <button
                    type="button"
                    className="danger-button compact-button history-delete-button"
                    onClick={() => handleDeleteHistorySession(session)}
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
          )}

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
