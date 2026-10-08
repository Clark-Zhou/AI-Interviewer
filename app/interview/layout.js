/**
 * 文件职责：为受保护的面试区统一提供账号状态、五入口导航和离开保护。
 * 关联文件：components/AuthStatusBar.js、components/InterviewNavigation.js、components/InterviewLeaveGuard.js。
 * 注意事项：所有 /interview 子页面共享此布局；未登录时跳转登录页。
 */
import { redirect } from 'next/navigation';
import AuthStatusBar from '../../components/AuthStatusBar';
import { InterviewLeaveGuardProvider } from '../../components/InterviewLeaveGuard';
import InterviewNavigation from '../../components/InterviewNavigation';
import { createSupabaseServerClient } from '../../lib/supabase/serverClient';

export const dynamic = 'force-dynamic';

// 登录校验集中在面试区布局，同时由 proxy 保护所有子路由请求。
export default async function InterviewLayout({ children }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <InterviewLeaveGuardProvider>
      <div className="interview-shell">
        <AuthStatusBar userEmail={user.email} />
        <InterviewNavigation />
        {children}
      </div>
    </InterviewLeaveGuardProvider>
  );
}
