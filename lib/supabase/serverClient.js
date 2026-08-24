/**
 * 文件职责：创建服务端 Supabase client。
 *
 * 关联文件：
 * - app/interview/page.js：服务端检查当前用户，保护面试工作台入口页。
 * - app/interview/new/page.js：服务端检查当前用户，保护新面试流程页。
 * - app/interview/history/page.js：服务端检查当前用户，保护本地历史记录页。
 *
 * 说明：
 * - 这里只能使用 Supabase publishable/anon key。
 * - 服务端 client 只读取/刷新 Supabase Auth cookie，不接云端历史记录。
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createSupabaseConfigError, getSupabaseConfig } from './config';

export async function createSupabaseServerClient() {
  const { supabaseUrl, publishableKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    throw createSupabaseConfigError();
  }

  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    publishableKey,
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
