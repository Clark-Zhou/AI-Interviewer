/**
 * 文件职责：受保护的本地历史记录页面。
 *
 * 关联文件：
 * - components/InterviewHistoryPanel.js：读取并展示浏览器本地历史记录。
 * - components/AuthStatusBar.js：展示当前用户并提供登出入口。
 * - app/interview/page.js：面试工作台入口页。
 * - lib/supabase/serverClient.js：服务端读取 Supabase Auth 用户。
 *
 * 说明：
 * - `/interview/history` 需要登录后访问；未登录用户会回到 `/login`。
 * - 本页只读取当前浏览器 localStorage，不做云端历史记录或数据库查询。
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthStatusBar from '../../../components/AuthStatusBar';
import InterviewHistoryPanel from '../../../components/InterviewHistoryPanel';
import { createSupabaseServerClient } from '../../../lib/supabase/serverClient';

export const dynamic = 'force-dynamic';

// 历史页面：服务端确认登录态后，客户端组件再读取 localStorage。
export default async function InterviewHistoryPage() {
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
      <main className="page">
        <section className="panel workspace-subpage-heading">
          <p className="category">本地历史记录</p>
          <h1>查看历史记录</h1>
          <p className="subtitle">
            这里只展示当前浏览器本地保存的最近记录，不做云端同步。
          </p>
          <div className="button-row">
            <Link className="text-link" href="/interview">
              返回工作台
            </Link>
            <Link className="text-link" href="/interview/new">
              开始新的面试
            </Link>
          </div>
        </section>
        <InterviewHistoryPanel />
      </main>
    </>
  );
}
