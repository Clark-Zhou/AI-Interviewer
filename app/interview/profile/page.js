/**
 * 文件职责：提供个人中心的页面骨架。
 * 关联文件：app/interview/layout.js、components/InterviewNavigation.js。
 * 注意事项：账号信息和登出仍由共享布局的 AuthStatusBar 提供。
 */
export default function ProfilePage() {
  return (
    <main className="page">
      <section className="panel workspace-placeholder-panel">
        <p className="category">个人中心</p>
        <h1>个人中心</h1>
      </section>
    </main>
  );
}
