/**
 * 文件职责：模拟面试主界面路由。
 *
 * 关联文件：
 * - components/InterviewSimulator.js：现有模拟面试主功能。
 * - components/AuthStatusBar.js：展示当前用户并提供登出入口。
 * - lib/supabase/serverClient.js：服务端读取 Supabase Auth 用户。
 * - app/login/page.js：体验版入口页壳路由。
 *
 * 说明：
 * - `/interview` 需要登录后访问；未登录用户会回到 `/login`。
 * - 本阶段不做云端历史记录、用户资料页或角色权限系统。
 */
import { redirect } from 'next/navigation';
import AuthStatusBar from '../../components/AuthStatusBar';
import InterviewSimulator from '../../components/InterviewSimulator';
import { createSupabaseServerClient } from '../../lib/supabase/serverClient';

export const dynamic = 'force-dynamic';

// 面试主界面路由：服务端先确认 Supabase 登录态，再渲染现有模拟面试组件。
export default async function InterviewPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <>
      <AuthStatusBar userEmail={user.email} />
      <InterviewSimulator />
    </>
  );
}
