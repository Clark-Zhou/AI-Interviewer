/**
 * 文件职责：共享新面试未保存内容的离开保护状态。
 * 关联文件：app/interview/layout.js、components/InterviewSimulator.js、components/AccountSignOutButton.js。
 * 注意事项：页面链接使用原生跳转；刷新、返回与关闭由浏览器的 beforeunload 提示处理。
 */
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const InterviewLeaveGuardContext = createContext(null);

export function InterviewLeaveGuardProvider({ children }) {
  const [hasUnsavedInterview, setHasUnsavedInterview] = useState(false);

  // 原生页面离开统一交给浏览器提示；浏览器决定最终展示的文案。
  useEffect(() => {
    if (!hasUnsavedInterview) {
      return undefined;
    }

    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedInterview]);

  return (
    <InterviewLeaveGuardContext.Provider value={{ hasUnsavedInterview, setHasUnsavedInterview }}>
      {children}
    </InterviewLeaveGuardContext.Provider>
  );
}

export function useInterviewLeaveGuard() {
  const context = useContext(InterviewLeaveGuardContext);

  if (!context) {
    throw new Error('面试离开保护必须在 InterviewLeaveGuardProvider 内使用。');
  }

  return context;
}
