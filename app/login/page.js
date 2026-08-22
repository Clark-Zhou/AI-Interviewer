/**
 * 文件职责：登录入口页面路由。
 *
 * 关联文件：
 * - components/LoginEntryShell.js：登录入口页面壳，只做前端体验入口。
 * - app/interview/page.js：体验版入口点击后进入的模拟面试主界面路由。
 *
 * 说明：
 * - `/login` 只展示入口页壳，不做真实登录、注册、鉴权或密码保存。
 */
import LoginEntryShell from '../../components/LoginEntryShell';

// 登录入口路由：展示体验版入口页壳。
export default function LoginPage() {
  return <LoginEntryShell />;
}
