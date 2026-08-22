/**
 * 文件职责：登录入口页面路由。
 *
 * 关联文件：
 * - components/LoginEntryShell.js：Supabase Auth 登录/注册入口页面壳。
 * - app/interview/page.js：登录成功后进入的模拟面试主界面路由。
 *
 * 说明：
 * - `/login` 支持邮箱密码登录和注册，但不保存密码、不做用户资料页或权限系统。
 */
import LoginEntryShell from '../../components/LoginEntryShell';

// 登录入口路由：展示 Supabase Auth 登录/注册入口页壳。
export default function LoginPage() {
  return <LoginEntryShell />;
}
