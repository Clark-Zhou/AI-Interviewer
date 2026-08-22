/**
 * 文件职责：集中校验 Supabase Auth 的公开环境变量。
 *
 * 关联文件：
 * - lib/supabase/browserClient.js：创建浏览器端 Supabase client 前读取配置。
 * - lib/supabase/serverClient.js：创建服务端 Supabase client 前读取配置。
 * - proxy.js：刷新 Auth cookie 前先判断配置是否可用。
 *
 * 说明：
 * - 这里只读取 publishable/anon key 对应的公开环境变量。
 * - 不读取、不使用、不打印 Supabase service_role key。
 */
const SUPABASE_CONFIG_ERROR =
  'Supabase Auth 配置无效：NEXT_PUBLIC_SUPABASE_URL 必须是 http/https URL，NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 不能为空。修改 .env.local 后请重启 dev server。';

function isHttpUrl(value) {
  if (!value) {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return {
    supabaseUrl,
    publishableKey,
    isConfigured: isHttpUrl(supabaseUrl) && Boolean(publishableKey),
  };
}

export function createSupabaseConfigError() {
  return new Error(SUPABASE_CONFIG_ERROR);
}
