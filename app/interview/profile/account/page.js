/**
 * 文件职责：展示当前账号资料、昵称和密码设置入口与登出入口。
 * 关联文件：app/interview/profile/page.js、components/AccountSettingsPanel.js、components/AccountSignOutButton.js。
 * 注意事项：邮箱和手机号保持只读；密码更新由客户端 Supabase Auth 会话完成，不读取旧密码。
 */
import { redirect } from 'next/navigation';
import AccountSettingsPanel from '../../../../components/AccountSettingsPanel';
import AccountSignOutButton from '../../../../components/AccountSignOutButton';
import ProfileAvatar from '../../../../components/ProfileAvatar';
import { createSupabaseServerClient } from '../../../../lib/supabase/serverClient';
import { getDisplayNickname } from '../../../../lib/userProfile';
import { isAuthServiceUnavailable } from '../../../../lib/supabase/authState';
import AuthUnavailableNotice from '../../../../components/AuthUnavailableNotice';

export default async function AccountPage() {
  // 账户数据以服务端认证会话为准，不从浏览器缓存推断身份。
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (isAuthServiceUnavailable(error)) return <AuthUnavailableNotice href="/interview/profile/account" />;
  if (!user) redirect('/login');
  const nickname = getDisplayNickname(user.user_metadata?.nickname);

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
            <p className="profile-account-name">{nickname}</p>
          </div>
        </div>
        <AccountSettingsPanel
          initialNickname={nickname}
          email={user.email || ''}
          phoneStatus={user.phone ? '已绑定' : '未绑定'}
        />
      </section>
      <section className="panel profile-signout-panel" aria-label="登录状态">
        <div><h2>登录状态</h2><p>退出当前账号后，需要重新登录才能访问面试区。</p></div>
        <AccountSignOutButton />
      </section>
    </main>
  );
}
