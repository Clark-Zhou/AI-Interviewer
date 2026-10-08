/**
 * 文件职责：在个人中心展示当前登录邮箱与登出入口。
 * 关联文件：app/interview/layout.js、components/AuthStatusBar.js、lib/supabase/serverClient.js。
 * 注意事项：只读取当前 Auth 用户，不增加资料编辑或账号存储。
 */
import { redirect } from 'next/navigation';
import AuthStatusBar from '../../../components/AuthStatusBar';
import { createSupabaseServerClient } from '../../../lib/supabase/serverClient';

export default async function ProfilePage() {
  // 保持账号资料由服务端认证会话提供，不从客户端缓存推断用户身份。
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className="page profile-page">
      <section className="panel workspace-subpage-heading">
        <p className="category">个人中心</p>
        <h1>个人中心</h1>
        <p className="subtitle">管理当前登录状态。</p>
      </section>
      <AuthStatusBar userEmail={user.email} />
    </main>
  );
}
