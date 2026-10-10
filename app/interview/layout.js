/**
 * 文件职责：为受保护的面试区统一提供品牌页头、五入口导航和离开保护。
 * 关联文件：components/InterviewNavigation.js、components/InterviewLeaveGuard.js、app/interview/profile/page.js。
 * 注意事项：所有 /interview 子页面共享此布局；未登录时跳转登录页。
 */
import { redirect } from 'next/navigation';
import { InterviewLeaveGuardProvider } from '../../components/InterviewLeaveGuard';
import InterviewNavigation from '../../components/InterviewNavigation';
import { createSupabaseServerClient } from '../../lib/supabase/serverClient';
import { isAuthServiceUnavailable } from '../../lib/supabase/authState';
import AuthUnavailableNotice from '../../components/AuthUnavailableNotice';

export const dynamic = 'force-dynamic';

// 登录校验集中在面试区布局，同时由 proxy 保护所有子路由请求。
export default async function InterviewLayout({ children }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }, error,
  } = await supabase.auth.getUser();

  if (isAuthServiceUnavailable(error)) {
    return <div className="interview-shell"><AuthUnavailableNotice /></div>;
  }

  if (!user) {
    redirect('/login');
  }

  return (
    <InterviewLeaveGuardProvider>
      <div className="interview-shell">
        <header className="interview-site-header">
          <div className="interview-header-inner">
            <a className="interview-brand" href="/interview" aria-label="面试工作台">
              <span className="interview-brand-mark" aria-hidden="true">AI</span>
              <span className="interview-brand-name">AI Interview<span>面试练习工作台</span></span>
            </a>
            <InterviewNavigation />
          </div>
        </header>
        {children}
      </div>
    </InterviewLeaveGuardProvider>
  );
}
