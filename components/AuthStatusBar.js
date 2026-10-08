/**
 * 文件职责：展示当前登录用户和登出入口。
 *
 * 关联文件：
 * - app/interview/layout.js：在所有面试区页面上方挂载本组件。
 * - components/InterviewLeaveGuard.js：未完成面试时确认登出。
 * - lib/supabase/browserClient.js：浏览器端 Supabase Auth client。
 *
 * 说明：
 * - 本组件只做登出和轻量账号状态展示。
 * - 不读取、不保存、不打印用户密码或 Supabase token。
 */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase/browserClient';
import { useInterviewLeaveGuard } from './InterviewLeaveGuard';

// 未保存面试先展示页面内确认；实际登出后回到登录页并刷新认证状态。
export default function AuthStatusBar({ userEmail }) {
  const router = useRouter();
  const { hasUnsavedInterview } = useInterviewLeaveGuard();
  const cancelSignOutRef = useRef(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isConfirmingSignOut, setIsConfirmingSignOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  useEffect(() => {
    if (isConfirmingSignOut) {
      cancelSignOutRef.current?.focus();
    }
  }, [isConfirmingSignOut]);

  useEffect(() => {
    if (!hasUnsavedInterview) {
      setIsConfirmingSignOut(false);
    }
  }, [hasUnsavedInterview]);

  const performSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError('');

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        setSignOutError(error.message || '登出失败，请稍后重试。');
        return;
      }

      router.push('/login');
      router.refresh();
    } catch (error) {
      setSignOutError(error.message || '账号系统配置异常，请检查 Supabase 环境变量。');
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignOut = () => {
    if (hasUnsavedInterview) {
      setIsConfirmingSignOut(true);
      return;
    }

    performSignOut();
  };

  return (
    <div className="auth-status-bar">
      <div>
        <p className="auth-status-label">当前账号</p>
        <p className="auth-status-email">{userEmail || '已登录用户'}</p>
      </div>
      <div className="auth-status-actions">
        {signOutError && <p className="auth-status-error">{signOutError}</p>}
        <button
          type="button"
          className="secondary-button compact-button"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          {isSigningOut ? '正在登出...' : '登出'}
        </button>
      </div>
      {isConfirmingSignOut && (
        <div
          className="auth-signout-confirmation"
          role="group"
          aria-label="确认登出"
          aria-describedby="auth-unsaved-signout-warning"
        >
          <p id="auth-unsaved-signout-warning">当前面试尚未保存，登出后会丢失本次内容。</p>
          <div className="button-row">
            <button
              ref={cancelSignOutRef}
              type="button"
              className="secondary-button compact-button"
              onClick={() => setIsConfirmingSignOut(false)}
              disabled={isSigningOut}
              aria-describedby="auth-unsaved-signout-warning"
            >
              取消
            </button>
            <button
              type="button"
              className="danger-button compact-button"
              onClick={performSignOut}
              disabled={isSigningOut}
              aria-describedby="auth-unsaved-signout-warning"
            >
              {isSigningOut ? '正在登出...' : '继续登出'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
