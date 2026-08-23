/**
 * 文件职责：基础主页路由。
 *
 * 关联文件：
 * - app/login/page.js：登录入口页面壳路由。
 * - app/interview/page.js：受保护的模拟面试主界面路由。
 * - app/layout.js：页面外层 HTML 结构和全局样式入口。
 * - lib/supabase/serverClient.js：服务端读取 Supabase Auth 登录态。
 *
 * 说明：
 * - 根路径只做基础产品入口，不做复杂 landing page。
 * - 未登录用户不能从主页直接进入 `/interview`。
 */
import Link from 'next/link';
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

// 基础主页：提供登录入口、面试入口和当前账号状态，不承载面试业务逻辑。
export default async function Home() {
  const { user, isAuthConfigured } = await getHomeAuthState();
  const isLoggedIn = Boolean(user);
  const interviewHref = isLoggedIn ? '/interview' : '/login';

  return (
    <main className="home-page">
      <section className="home-shell" aria-label="AI Interview Simulator 主页">
        <header className="home-header">
          <div>
            <p className="home-kicker">AI Interview Simulator</p>
            <h1>用目标岗位和简历，快速完成一次模拟面试练习。</h1>
          </div>
          <div className={isLoggedIn ? 'home-status logged-in' : 'home-status'}>
            <span>{isLoggedIn ? '已登录' : '未登录'}</span>
            <strong>{isLoggedIn ? user.email : '请先登录或注册'}</strong>
          </div>
        </header>

        <div className="home-summary">
          <p>
            输入岗位 JD 和简历后，系统会生成结构化面试问题；提交回答后，再生成总分、优势、风险点和改进建议。
          </p>
          <p>
            当前历史记录仍保存在当前浏览器本地，没有云端同步。内部测试时请使用脱敏后的简历和岗位信息。
          </p>
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
          <Link className="home-secondary-link" href="/login">
            {isLoggedIn ? '账号入口' : '登录 / 注册'}
          </Link>
        </div>
      </section>
    </main>
  );
}
