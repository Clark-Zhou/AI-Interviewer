/**
 * 文件职责：刷新 Supabase Auth cookie，并保护需要登录的前端路由。
 *
 * 关联文件：
 * - lib/supabase/serverClient.js：服务端页面读取认证状态。
 * - app/interview/page.js：受保护的模拟面试主界面。
 * - app/login/page.js：未登录用户回到这里登录或注册。
 *
 * 说明：
 * - 本文件只使用 Supabase publishable/anon key。
 * - 不做角色权限、云端历史记录或 DeepSeek API 鉴权改造。
 */
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getSupabaseConfig } from './lib/supabase/config';

// proxy 负责刷新 Supabase cookie，避免刷新页面后登录态丢失。
export async function proxy(request) {
  let response = NextResponse.next({
    request,
  });

  const { supabaseUrl, publishableKey, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    if (request.nextUrl.pathname.startsWith('/interview')) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.search = '';
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  const supabase = createServerClient(
    supabaseUrl,
    publishableKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/interview')) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.search = '';
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

export const config = {
  matcher: ['/login', '/interview/:path*'],
};
