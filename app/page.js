/**
 * 文件职责：基础主页路由。
 *
 * 关联文件：
 * - app/login/page.js：登录入口页面壳路由。
 * - app/interview/page.js：受保护的面试工作台入口路由。
 * - app/layout.js：页面外层 HTML 结构和全局样式入口。
 * - lib/supabase/serverClient.js：服务端读取 Supabase Auth 登录态。
 *
 * 说明：
 * - 根路径只做基础产品入口，不做复杂 landing page。
 * - 未登录用户不能从主页直接进入 `/interview`。
 */
import Link from 'next/link';
import HomeSignOutButton from '../components/HomeSignOutButton';
import { getSupabaseConfig } from '../lib/supabase/config';
import { createSupabaseServerClient } from '../lib/supabase/serverClient';

export const dynamic = 'force-dynamic';

async function getHomeAuthState() {
  const { isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return {
      user: null,
      isAuthConfigured: false,
    };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return {
      user,
      isAuthConfigured: true,
    };
  } catch {
    return {
      user: null,
      isAuthConfigured: false,
    };
  }
}

// 基础主页：提供首屏入口、登录状态和轻量产品说明，不承载面试业务逻辑。
export default async function Home() {
  const { user, isAuthConfigured } = await getHomeAuthState();
  const isLoggedIn = Boolean(user);
  const interviewHref = isLoggedIn ? '/interview' : '/login';

  return (
    <main className="home-page">
      <section className="home-hero" aria-label="AI Interview Simulator 主页">
        <header className="home-nav">
          <Link className="home-brand" href="/">
            <span className="home-brand-mark" aria-hidden="true">
              AI
            </span>
            <span>AI Interview Simulator</span>
          </Link>

          <div className="home-nav-placeholders" aria-label="即将开放的功能">
            <button
              type="button"
              className="home-nav-placeholder"
              disabled
              title="帮助即将开放"
            >
              <span>帮助</span>
              <small>即将开放</small>
            </button>
            <button
              type="button"
              className="home-nav-placeholder"
              disabled
              title="公告即将开放"
            >
              <span>公告</span>
              <small>即将开放</small>
            </button>
          </div>

          <nav className="home-nav-links" aria-label="主页导航">
            {isLoggedIn ? (
              <HomeSignOutButton className="home-nav-sign-out" />
            ) : (
              <Link href="/login">登录入口</Link>
            )}
            <Link href={interviewHref}>{isLoggedIn ? '进入面试' : '面试入口'}</Link>
          </nav>
        </header>

        <div className="home-hero-grid">
          <div className="home-copy">
            <p className="home-kicker">AI Interview Simulator</p>
            <h1>面试之前，先练一次</h1>

            <p className="home-lede">
              基于岗位 JD 和个人简历生成针对性问题并在作答后提供结构化评价。
            </p>

            {!isAuthConfigured && (
              <p className="home-warning">
                Supabase Auth 配置待检查。登录和面试入口可能需要先配置环境变量。
              </p>
            )}

            <div className="home-actions" aria-label="主页入口">
              <Link className="home-primary-link" href={interviewHref}>
                {isLoggedIn ? '进入面试工作台' : '开始模拟面试'}
              </Link>
              {isLoggedIn ? (
                <HomeSignOutButton />
              ) : (
                <Link className="home-secondary-link" href="/login">
                  登录 / 注册
                </Link>
              )}
            </div>

            {isLoggedIn && (
              <p className="home-account" aria-live="polite">
                已登录 · {user.email}
              </p>
            )}
            <p className="home-note">记录仅保存在当前浏览器 · 请使用脱敏信息</p>
          </div>

          <div className="home-cover" aria-hidden="true">
            <div className="home-cover-card home-cover-card-main">
              <span className="home-cover-label">Role signal</span>
              <div className="home-cover-lines">
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="home-cover-card home-cover-card-side">
              <span className="home-cover-label">Fit map</span>
              <div className="home-cover-dots">
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
            <div className="home-cover-nodes">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
