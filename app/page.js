/**
 * 文件职责：首页入口文件。
 *
 * 关联文件：
 * - app/login/page.js：登录入口页面壳路由。
 * - app/interview/page.js：模拟面试主界面路由。
 * - app/layout.js：页面外层 HTML 结构和全局样式入口。
 *
 * 说明：
 * - 根路径不承载业务 UI，只负责把用户带到清晰的登录入口路由。
 */
import { redirect } from 'next/navigation';

// 根路径保持明确入口，避免继续使用首页内状态切换。
export default function Home() {
  redirect('/login');
}
