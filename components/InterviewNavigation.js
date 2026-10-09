/**
 * 文件职责：展示面试区五入口导航并标记当前区域。
 * 关联文件：app/interview/layout.js、app/globals.css。
 * 注意事项：使用原生页面跳转，让新面试的 beforeunload 能覆盖菜单切换和浏览器返回。
 */
'use client';

import { usePathname } from 'next/navigation';

const navigationItems = [
  { href: '/interview/resumes', label: '简历仓库', icon: 'resume' },
  { href: '/interview/history', label: '历史记录', icon: 'history' },
  { href: '/interview', label: '工作台', icon: 'workspace', isPrimary: true },
  { href: '/interview/analytics', label: '数据和分析', icon: 'analytics' },
  { href: '/interview/profile', label: '个人中心', icon: 'profile' },
];

// 线性图标与文字一起表达入口，SVG 本身隐藏给辅助技术以避免重复朗读。
function NavigationIcon({ name }) {
  const paths = {
    resume: <><path d="M6 3.5h8l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" /><path d="M14 3.5V8h4M9 12h6M9 16h6" /></>,
    history: <><path d="M4 11a8 8 0 1 1 2.3 5.7M4 5v6h6" /><path d="M12 7v5l3 2" /></>,
    workspace: <><path d="M4 4h16v16H4zM4 10h16M10 10v10" /></>,
    analytics: <><path d="M4 20h16M7 16v-5M12 16V6M17 16V9" /><circle cx="7" cy="9" r="1" /><circle cx="12" cy="4" r="1" /><circle cx="17" cy="7" r="1" /></>,
    profile: <><circle cx="12" cy="8" r="3.5" /><path d="M5 20a7 7 0 0 1 14 0" /></>,
  };

  return <svg className="interview-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

// 新面试属于工作台；账户子页面属于个人中心。
export default function InterviewNavigation() {
  const pathname = usePathname();

  return (
    <nav className="interview-navigation" aria-label="面试区导航">
      {navigationItems.map(({ href, label, icon, isPrimary }) => {
        const isActive = href === '/interview'
          ? pathname === href || pathname === '/interview/new'
          : href === '/interview/profile'
            ? pathname === href || pathname.startsWith(`${href}/`)
            : pathname === href;

        return (
          <a
            key={href}
            className={`interview-nav-item${isPrimary ? ' interview-nav-primary' : ''}${isActive ? ' is-active' : ''}`}
            href={href}
            aria-current={isActive ? (pathname === href ? 'page' : 'location') : undefined}
          >
            <NavigationIcon name={icon} />
            <span>{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
