/**
 * 文件职责：受保护的面试工作台入口页。
 *
 * 关联文件：
 * - components/AuthStatusBar.js：展示当前用户并提供登出入口。
 * - app/interview/new/page.js：承载新面试完整流程。
 * - app/interview/history/page.js：承载本地历史记录列表和详情。
 * - lib/supabase/serverClient.js：服务端读取 Supabase Auth 用户。
 * - app/login/page.js：体验版入口页壳路由。
 *
 * 说明：
 * - `/interview` 需要登录后访问；未登录用户会回到 `/login`。
 * - 本页只做工作台入口，不承载新面试表单或历史详情。
 * - 本阶段不做云端历史记录、用户资料页或角色权限系统。
 */
import Link from 'next/link';
import { redirect } from 'next/navigation';
import AuthStatusBar from '../../components/AuthStatusBar';
import { createSupabaseServerClient } from '../../lib/supabase/serverClient';

export const dynamic = 'force-dynamic';

// 工作台入口路由：服务端先确认 Supabase 登录态，再展示两个真实入口。
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
      <main className="page">
        <section className="panel workspace-panel">
          <div className="workspace-heading">
            <p className="category">面试工作台</p>
            <h1>选择这次要做的事情</h1>
            <p className="subtitle">
              你可以开始一次新的模拟面试，或者查看当前浏览器里保存的本地历史记录。
            </p>
          </div>

          <div className="workspace-actions" aria-label="面试工作台入口">
            <Link className="workspace-card" href="/interview/new">
              <span className="workspace-card-title">开始新的面试</span>
              <span className="workspace-card-description">
                填写岗位 JD 和简历，生成问题、提交回答，并获得最终评价。
              </span>
            </Link>
            <Link className="workspace-card" href="/interview/history">
              <span className="workspace-card-title">查看历史记录</span>
              <span className="workspace-card-description">
                查看最近保存在当前浏览器里的面试记录和问答详情。
              </span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
