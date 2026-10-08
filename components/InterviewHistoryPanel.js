/**
 * 文件职责：展示当前账号的云端面试历史，支持分页、详情、删除和手动导入本地旧记录。
 * 关联文件：app/interview/history/page.js、lib/client/interviewHistoryApi.js、lib/client/interviewHistoryStorage.js。
 * 注意事项：旧 localStorage 数据仅在用户确认导入时上传；导入后仍保留浏览器原件。
 */
'use client';

import { useEffect, useState } from 'react';
import {
  clearCloudInterviewSessions, deleteCloudInterviewSession, getCloudInterviewSession,
  importLocalInterviewSession, listCloudInterviewSessions,
} from '../lib/client/interviewHistoryApi';
import { getInterviewSessions } from '../lib/client/interviewHistoryStorage';

function getTextSummary(text, maxLength = 48) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  return normalized ? normalized.slice(0, maxLength) + (normalized.length > maxLength ? '...' : '') : '未填写内容';
}

function getHistorySessionTitle(session, maxLength = 48) {
  const title = String(session?.jobTitle || session?.jobInfo || '').replace(/\s+/g, ' ').trim();
  return title ? getTextSummary(title, maxLength) : '未命名岗位';
}

function formatHistoryTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '时间未知';
  return date.toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

function formatGenerationSource(source) {
  if (!source) return '';
  return `${source.questions === 'mock' ? 'Mock 问题' : 'AI 问题'} / ${source.evaluation === 'mock' ? 'Mock 评价' : 'AI 评价'}`;
}

export default function InterviewHistoryPanel() {
  const [historySessions, setHistorySessions] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [nextOffset, setNextOffset] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [detailRetry, setDetailRetry] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [isHistoryListCollapsed, setIsHistoryListCollapsed] = useState(false);
  const [localCount, setLocalCount] = useState(0);
  const [historyActionMessage, setHistoryActionMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [detailError, setDetailError] = useState('');

  // 列表只读取云端；本地旧记录仅用于决定是否展示手动导入入口。
  useEffect(() => {
    let active = true;
    setLocalCount(getInterviewSessions().length);
    listCloudInterviewSessions(0).then((result) => {
      if (!active) return;
      setHistorySessions(result.items);
      setNextOffset(result.nextOffset);
      setSelectedId(result.items[0]?.id || '');
    }).catch((error) => {
      if (active) setLoadError(error.message);
    }).finally(() => {
      if (active) setIsLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedSession(null);
      setDetailError('');
      return undefined;
    }
    let active = true;
    setIsDetailLoading(true);
    setDetailError('');
    setSelectedSession(null);
    getCloudInterviewSession(selectedId).then((result) => {
      if (active) setSelectedSession(result.session);
    }).catch((error) => {
      if (active) setDetailError(error.message);
    }).finally(() => {
      if (active) setIsDetailLoading(false);
    });
    return () => { active = false; };
  }, [selectedId, detailRetry]);

  const reloadFirstPage = async () => {
    setIsLoading(true);
    setLoadError('');
    try {
      const result = await listCloudInterviewSessions(0);
      setHistorySessions(result.items);
      setNextOffset(result.nextOffset);
      setSelectedId(result.items[0]?.id || '');
      if (selectedId === result.items[0]?.id) setDetailRetry((value) => value + 1);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (nextOffset === null || isLoadingMore) return;
    setIsLoadingMore(true);
    setLoadError('');
    try {
      const result = await listCloudInterviewSessions(nextOffset);
      setHistorySessions((current) => [
        ...current, ...result.items.filter((item) => !current.some((old) => old.id === item.id)),
      ]);
      setNextOffset(result.nextOffset);
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleDeleteHistorySession = async (session) => {
    if (!window.confirm(`确定删除「${getHistorySessionTitle(session, 36)}」这条云端历史记录吗？`)) return;
    setIsBusy(true);
    setHistoryActionMessage('');
    try {
      await deleteCloudInterviewSession(session.id);
      setSelectedId('');
      await reloadFirstPage();
      setHistoryActionMessage('已删除这条云端历史记录。');
    } catch (error) {
      setHistoryActionMessage(error.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleClearHistorySessions = async () => {
    if (!window.confirm('确定清空当前账号的全部云端历史记录吗？此操作无法撤销；浏览器中的旧本地记录不会删除。')) return;
    setIsBusy(true);
    setHistoryActionMessage('');
    try {
      await clearCloudInterviewSessions();
      setHistorySessions([]);
      setNextOffset(null);
      setSelectedId('');
      setSelectedSession(null);
      setHistoryActionMessage('已清空当前账号的云端历史记录。');
    } catch (error) {
      setHistoryActionMessage(error.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleImportLocal = async () => {
    const localSessions = getInterviewSessions();
    if (!localSessions.length) { setLocalCount(0); return; }
    if (!window.confirm(`确定把此浏览器的 ${localSessions.length} 条旧历史导入当前账号吗？这些记录可能是在其他账号登录时产生的；原记录仍会留在此浏览器。`)) return;
    setIsBusy(true);
    setHistoryActionMessage('');
    let imported = 0;
    let duplicates = 0;
    let failed = 0;
    // 逐条导入，单条损坏或网络错误不会阻断其余记录。
    for (const session of localSessions) {
      try {
        const result = await importLocalInterviewSession(session);
        if (result.duplicate) duplicates += 1;
        else imported += 1;
      } catch {
        failed += 1;
      }
    }
    await reloadFirstPage();
    setHistoryActionMessage(`导入完成：新增 ${imported} 条，重复 ${duplicates} 条，失败 ${failed} 条。浏览器原记录已保留。`);
    setIsBusy(false);
  };

  const selectedScore = selectedSession?.evaluation?.overallScore;
  const selectedSource = formatGenerationSource(selectedSession?.generationSource);

  return (
    <section className="panel history-panel">
      <div className="preview-header">
        <h2>历史记录</h2>
        <div className="history-panel-actions">
          {historySessions.length > 0 && <span className="answer-progress">已加载 {historySessions.length} 条</span>}
          {localCount > 0 && (
            <button className="secondary-button compact-button" type="button" disabled={isBusy} onClick={handleImportLocal}>
              {isBusy ? '正在处理…' : `导入此浏览器历史（${localCount}）`}
            </button>
          )}
          {historySessions.length > 0 && (
            <>
              <button className="secondary-button compact-button" type="button" onClick={() => setIsHistoryListCollapsed((value) => !value)}>
                {isHistoryListCollapsed ? '展开左栏' : '收起左栏'}
              </button>
              <button className="danger-button compact-button" type="button" disabled={isBusy} onClick={handleClearHistorySessions}>清空全部</button>
            </>
          )}
        </div>
      </div>

      {historyActionMessage && <p className="history-action-message" role="status">{historyActionMessage}</p>}
      {loadError && <p className="resume-feedback resume-feedback-error" role="alert">{loadError}</p>}
      {loadError && <button className="secondary-button compact-button" type="button" onClick={reloadFirstPage}>重新读取</button>}
      {isLoading && <p className="empty-state">正在读取云端历史记录…</p>}
      {!isLoading && !loadError && historySessions.length === 0 && (
        <p className="empty-state">生成最终评价并保存后，这里会显示当前账号的面试历史。</p>
      )}

      {historySessions.length > 0 && (
        <div className={`history-layout ${isHistoryListCollapsed ? 'collapsed' : ''}`}>
          {!isHistoryListCollapsed && (
            <div>
              <ul className="history-list">
                {historySessions.map((session) => (
                  <li className="history-item-row" key={session.id}>
                    <button type="button" className={`history-item-button ${selectedId === session.id ? 'active' : ''}`}
                      onClick={() => setSelectedId(session.id)}>
                      <span className="history-item-main">
                        <span className="history-title">{getHistorySessionTitle(session, 36)}</span>
                        <span className="history-meta">{formatHistoryTime(session.createdAt)}
                          {typeof session.overallScore === 'number' ? ` ｜ ${session.overallScore} / 100` : ''}
                        </span>
                      </span>
                    </button>
                    <button className="danger-button compact-button history-delete-button" type="button" disabled={isBusy}
                      onClick={() => handleDeleteHistorySession(session)}>删除</button>
                  </li>
                ))}
              </ul>
              {nextOffset !== null && (
                <button className="secondary-button compact-button history-load-more" type="button"
                  disabled={isLoadingMore} onClick={handleLoadMore}>
                  {isLoadingMore ? '正在加载…' : '加载更多'}
                </button>
              )}
            </div>
          )}

          <div className="history-detail">
            {isDetailLoading && <p className="empty-state">正在读取详情…</p>}
            {detailError && <p className="resume-feedback resume-feedback-error" role="alert">{detailError}</p>}
            {detailError && <button className="secondary-button compact-button" type="button" onClick={() => setDetailRetry((value) => value + 1)}>重试读取详情</button>}
            {!isDetailLoading && !detailError && !selectedSession && <p className="empty-state">选择一条历史记录查看详情。</p>}
            {selectedSession && (
              <>
                <div className="history-detail-header">
                  <div>
                    <p className="category">{formatHistoryTime(selectedSession.createdAt)}</p>
                    <h3>{getHistorySessionTitle(selectedSession, 56)}</h3>
                    {selectedSource && <p className="history-source detail-source">{selectedSource}</p>}
                  </div>
                  {typeof selectedScore === 'number' && <span className="evaluation-score">{selectedScore} / 100</span>}
                </div>
                <div className="history-detail-block"><h4>岗位信息摘要</h4><p>{getTextSummary(selectedSession.jobInfo, 120)}</p></div>
                <div className="history-detail-block"><h4>简历摘要</h4><p>{getTextSummary(selectedSession.resume, 120)}</p></div>
                {typeof selectedSession.evaluation?.summary === 'string' && (
                  <div className="history-detail-block"><h4>整体评价</h4><p>{selectedSession.evaluation.summary}</p></div>
                )}
                <div className="history-detail-block">
                  <h4>问答记录</h4>
                  <ul className="history-qa-list">
                    {(Array.isArray(selectedSession.questionAnswers) ? selectedSession.questionAnswers : []).map((item, index) => (
                      <li key={`${selectedSession.id}-${index}`}>
                        <p className="category">第 {index + 1} 题｜{String(item?.category || '')}</p>
                        <p className="question">{String(item?.question || '')}</p>
                        <p className="reason">回答：{String(item?.answer || '')}</p>
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
