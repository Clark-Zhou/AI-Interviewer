/**
 * 文件职责：创建服务端 Supabase client。
 *
 * 关联文件：
 * - app/interview/page.js：服务端检查当前用户，保护面试主界面。
 *
 * 说明：
 * - 这里只能使用 Supabase publishable/anon key。
 * - 服务端 client 只读取/刷新 Supabase Auth cookie，不接云端历史记录。
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Component 场景可能不能写 cookie；proxy 会负责刷新认证 cookie。
          }
        },
      },
    }
  );
}
