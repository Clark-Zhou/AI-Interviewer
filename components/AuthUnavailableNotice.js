/**
 * 文件职责：在账号服务暂时不可用时展示可重试状态。
 * 关联文件：app/interview/layout.js、app/interview/profile/account/page.js。
 * 注意事项：不展示个人资料，也不把服务错误称为账号退出。
 */
export default function AuthUnavailableNotice({ href = '/interview' }) {
  return (
    <main className="page">
      <section className="panel interview-auth-unavailable" role="status">
        <p className="category">账号状态</p>
        <h1>暂时无法确认登录状态</h1>
        <p>账号服务连接暂时不可用。请稍后重新检查，通常无需再次输入密码。</p>
        <a href={href}>重新检查登录状态</a>
      </section>
    </main>
  );
}
