/**
 * 文件职责：展示个人中心总览与账户入口。
 * 关联文件：app/interview/profile/account/page.js、components/ProfileAvatar.js。
 * 注意事项：总览不显示邮箱；未实现的模块只作为静态信息展示。
 */
import ProfileAvatar from '../../../components/ProfileAvatar';
import { createSupabaseServerClient } from '../../../lib/supabase/serverClient';
import { getDisplayNickname } from '../../../lib/userProfile';
import { isAuthServiceUnavailable } from '../../../lib/supabase/authState';
import AuthUnavailableNotice from '../../../components/AuthUnavailableNotice';

const profileModules = [
  { label: '主题外观', description: '界面风格与阅读体验', icon: 'theme' },
  { label: '使用手册', description: '了解面试练习流程', icon: 'guide' },
  { label: '建议和反馈', description: '分享使用体验', icon: 'feedback' },
  { label: '关于我们', description: '了解 AI Interview', icon: 'about' },
  { label: '更多设置', description: '其他个人偏好', icon: 'settings' },
];

// 这些图标仅作视觉辅助，静态条目不会获得链接或按钮语义。
function ProfileModuleIcon({ name }) {
  const paths = {
    theme: <><circle cx="12" cy="12" r="8" /><path d="M12 4v16M4 12h16" /></>,
    guide: <><path d="M4 5.5c2.5-1 5.3-.8 8 1v13c-2.7-1.8-5.5-2-8-1zM20 5.5c-2.5-1-5.3-.8-8 1M20 5.5v13c-2.5-1-5.3-.8-8 1" /></>,
    feedback: <><path d="M5 5h14v11H9l-4 3zM8 9h8M8 12h5" /></>,
    about: <><circle cx="12" cy="12" r="8" /><path d="M12 11v5M12 8h.01" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /></>,
  };

  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default async function ProfilePage() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (isAuthServiceUnavailable(error)) return <AuthUnavailableNotice href="/interview/profile" />;
  const nickname = getDisplayNickname(user?.user_metadata?.nickname);

  return (
    <main className="page profile-overview-page">
      <section className="profile-overview-hero" aria-labelledby="profile-page-title">
        <div className="profile-cover">
          <div className="profile-cover-art" aria-hidden="true"><span /><span /><span /></div>
          <p className="category">我的空间</p>
          <h1 id="profile-page-title">个人中心</h1>
        </div>
        <a className="profile-identity-link" href="/interview/profile/account" aria-label={`${nickname}，进入账户`}>
          <ProfileAvatar />
          <span className="profile-display-name">{nickname}</span>
          <span className="profile-identity-action">账户</span>
        </a>
      </section>

      <section className="panel profile-module-panel" aria-labelledby="profile-module-title">
        <div className="profile-module-heading">
          <p className="category">个人中心</p>
          <h2 id="profile-module-title">常用内容</h2>
        </div>
        <ul className="profile-module-list">
          {profileModules.map(({ label, description, icon }) => (
            <li className="profile-module-row" key={label}>
              <span className="profile-module-icon"><ProfileModuleIcon name={icon} /></span>
              <span className="profile-module-copy"><strong>{label}</strong><span>{description}</span></span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
