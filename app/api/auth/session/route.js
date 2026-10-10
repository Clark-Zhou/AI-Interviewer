/**
 * 文件职责：确认浏览器登录后，服务端能否识别当前 Supabase 会话。
 * 关联文件：components/LoginEntryShell.js、lib/supabase/serverClient.js。
 * 注意事项：只返回状态类别，不返回用户信息或会话令牌。
 */
import { createSupabaseServerClient } from '../../../../lib/supabase/serverClient';
import { isAuthServiceUnavailable } from '../../../../lib/supabase/authState';

export const runtime = 'nodejs';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const expectedUserId = body?.expectedUserId;
  if (typeof expectedUserId !== 'string' || expectedUserId.length > 100 || !expectedUserId) {
    return Response.json({ status: 'invalid_request' }, {
      status: 400,
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    // 网络错误和确实缺少会话不同，避免把服务故障误报成账号退出。
    if (isAuthServiceUnavailable(error)) {
      return Response.json({ status: 'unavailable' }, {
        status: 503,
        headers: { 'Cache-Control': 'no-store' },
      });
    }

    // 防止旧账号 cookie 残留时，将旧会话误认为本次登录的新账号。
    const status = !user ? 'unauthenticated' : user.id === expectedUserId ? 'authenticated' : 'mismatch';
    return Response.json({ status }, {
      status: status === 'authenticated' ? 200 : status === 'mismatch' ? 409 : 401,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ status: 'unavailable' }, {
      status: 503,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
