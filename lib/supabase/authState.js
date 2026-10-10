/**
 * 文件职责：区分暂时的 Supabase 服务错误与确实未登录。
 * 关联文件：proxy.js、app/page.js、app/interview/layout.js、app/api/auth/session/route.js。
 * 注意事项：只有可重试的网络或服务错误才阻止“未登录”判断，其他认证错误仍按未登录处理。
 */
export function isAuthServiceUnavailable(error) {
  const status = Number(error?.status);
  return error?.name === 'AuthRetryableFetchError' || status === 408 || status === 429 || status >= 500;
}
