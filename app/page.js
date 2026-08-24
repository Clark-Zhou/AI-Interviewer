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
            <p className="home-kicker">Interview preparation workspace</p>
            <h1>把岗位信息和个人经历，整理成一次更清晰的面试练习。</h1>

            <p className="home-lede">
              输入岗位 JD 和简历后，系统会生成结构化面试问题；提交回答后，再生成总分、优势、风险点和改进建议。
            </p>
            <p className="home-note">
              当前历史记录仍保存在当前浏览器本地，没有云端同步。内部测试时请使用脱敏后的简历和岗位信息。
            </p>

            <div
              className={isLoggedIn ? 'home-status logged-in' : 'home-status'}
              aria-live="polite"
            >
              <span>{isLoggedIn ? '当前已登录' : '当前未登录'}</span>
              <strong>{isLoggedIn ? user.email : '请先登录或注册后进入面试'}</strong>
            </div>

            {!isAuthConfigured && (
              <p className="home-warning">
                Supabase Auth 配置待检查。登录和面试入口可能需要先配置环境变量。
              </p>
            )}

            <div className="home-actions" aria-label="主页入口">
              <Link className="home-primary-link" href={interviewHref}>
                {isLoggedIn ? '进入模拟面试' : '登录后进入面试'}
              </Link>
              {isLoggedIn ? (
                <HomeSignOutButton />
              ) : (
                <Link className="home-secondary-link" href="/login">
                  登录 / 注册
                </Link>
              )}
            </div>
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
