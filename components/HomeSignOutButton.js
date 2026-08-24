/**
 * 文件职责：主页已登录状态下的登出按钮。
 *
 * 关联文件：
 * - app/page.js：主页根据登录态展示本组件。
 * - lib/supabase/browserClient.js：浏览器端 Supabase Auth client。
 *
 * 说明：
 * - 本组件只处理主页登出，不读取、不保存、不打印密码或 token。
 * - 登出成功后停留在根路径 `/`，让主页刷新为未登录状态。
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase/browserClient';

// 主页登出后刷新根路径，避免已登录视图继续残留在页面上。
export default function HomeSignOutButton({ className = 'home-secondary-link' }) {
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

      router.push('/');
      router.refresh();
    } catch (error) {
      setSignOutError(error.message || '账号系统配置异常，请检查 Supabase 环境变量。');
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <span className="home-sign-out">
      <button
        type="button"
        className={className}
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        {isSigningOut ? '正在登出...' : '登出'}
      </button>
      {signOutError && <span className="home-sign-out-error">{signOutError}</span>}
    </span>
  );
}
