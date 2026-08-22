/**
 * 文件职责：创建浏览器端 Supabase client。
 *
 * 关联文件：
 * - components/LoginEntryShell.js：用于登录、注册和读取认证状态。
 * - components/AuthStatusBar.js：用于登出。
 *
 * 说明：
 * - 这里只能使用 Supabase publishable/anon key。
 * - 不要在这里使用 service_role key，也不要记录用户密码或 session token。
 */
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
