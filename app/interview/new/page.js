/**
 * 文件职责：受保护的新面试流程页面。
 *
 * 关联文件：
 * - components/InterviewSimulator.js：承载新面试完整流程。
 * - components/AuthStatusBar.js：展示当前用户并提供登出入口。
 * - app/interview/page.js：面试工作台入口页。
 * - lib/supabase/serverClient.js：服务端读取 Supabase Auth 用户。
 *
 * 说明：
 * - `/interview/new` 需要登录后访问；未登录用户会回到 `/login`。
 * - 本页复用现有新面试流程，不改 DeepSeek API、prompt 或历史记录数据结构。
 */
import { redirect } from 'next/navigation';
import AuthStatusBar from '../../../components/AuthStatusBar';
import InterviewSimulator from '../../../components/InterviewSimulator';
import { createSupabaseServerClient } from '../../../lib/supabase/serverClient';

export const dynamic = 'force-dynamic';

// 新面试页面：服务端确认登录态后渲染现有完整面试流程。
export default async function NewInterviewPage() {
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
