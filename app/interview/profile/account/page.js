/**
 * 文件职责：展示当前账号的只读资料与登出入口。
 * 关联文件：app/interview/profile/page.js、components/AccountSignOutButton.js、lib/supabase/serverClient.js。
 * 注意事项：仅从当前认证会话读取邮箱和手机号状态，不提供资料编辑。
 */
import { redirect } from 'next/navigation';
import AccountSignOutButton from '../../../../components/AccountSignOutButton';
import ProfileAvatar from '../../../../components/ProfileAvatar';
import { createSupabaseServerClient } from '../../../../lib/supabase/serverClient';

export default async function AccountPage() {
  // 账户数据以服务端认证会话为准，不从浏览器缓存推断身份。
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className="page profile-account-page">
      <a className="profile-back-link" href="/interview/profile">← 返回个人中心</a>
      <section className="panel profile-account-panel" aria-labelledby="account-page-title">
        <p className="category">个人中心 / 账户</p>
        <h1 id="account-page-title">账户</h1>
        <div className="profile-account-identity">
          <ProfileAvatar />
          <div>
            <p className="profile-account-caption">当前用户</p>
            <p className="profile-account-name">面试用户</p>
          </div>
        </div>
        <dl className="profile-account-details">
          <div><dt>昵称</dt><dd>面试用户</dd></div>
          <div><dt>绑定邮箱</dt><dd className="profile-account-email">{user.email || '未绑定'}</dd></div>
          <div><dt>手机号</dt><dd>{user.phone ? '已绑定' : '未绑定'}</dd></div>
          <div><dt>登录密码</dt><dd>用于账号登录</dd></div>
        </dl>
      </section>
      <section className="panel profile-signout-panel" aria-label="登录状态">
        <div><h2>登录状态</h2><p>退出当前账号后，需要重新登录才能访问面试区。</p></div>
        <AccountSignOutButton />
      </section>
    </main>
  );
}
