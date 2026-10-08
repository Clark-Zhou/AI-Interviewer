/**
 * 文件职责：展示面试区五入口导航并标记当前区域。
 * 关联文件：app/interview/layout.js、app/globals.css。
 * 注意事项：使用原生页面跳转，让新面试的 beforeunload 能覆盖菜单切换和浏览器返回。
 */
'use client';

import { usePathname } from 'next/navigation';

const navigationItems = [
  { href: '/interview/resumes', label: '简历仓库' },
  { href: '/interview/history', label: '历史记录' },
  { href: '/interview', label: '工作台', isPrimary: true },
  { href: '/interview/analytics', label: '数据和分析' },
  { href: '/interview/profile', label: '个人中心' },
];

// 新面试属于工作台；其他入口仅在自己的页面高亮。
export default function InterviewNavigation() {
  const pathname = usePathname();

  return (
    <nav className="interview-navigation" aria-label="面试区导航">
      {navigationItems.map(({ href, label, isPrimary }) => {
        const isActive = href === '/interview'
          ? pathname === href || pathname === '/interview/new'
          : pathname === href;

        return (
          <a
            key={href}
            className={`interview-nav-item${isPrimary ? ' interview-nav-primary' : ''}${isActive ? ' is-active' : ''}`}
            href={href}
            aria-current={isActive ? (pathname === href ? 'page' : 'location') : undefined}
          >
            {isPrimary && <span className="interview-nav-plus" aria-hidden="true">+</span>}
            <span>{label}</span>
          </a>
        );
      })}
    </nav>
  );
}
