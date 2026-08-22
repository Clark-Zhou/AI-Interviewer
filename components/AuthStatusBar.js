/**
 * 文件职责：展示当前登录用户和登出入口。
 *
 * 关联文件：
 * - app/interview/page.js：在模拟面试主界面上方挂载本组件。
 * - lib/supabase/browserClient.js：浏览器端 Supabase Auth client。
 *
 * 说明：
 * - 本组件只做登出和轻量账号状态展示。
 * - 不读取、不保存、不打印用户密码或 Supabase token。
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase/browserClient';

// 登出后回到登录页，并让受保护页面重新校验认证状态。
export default function AuthStatusBar({ userEmail }) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');

  const handleSignOut = async () => {
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
    </div>
  );
}
