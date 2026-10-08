/**
 * 文件职责：提供简历仓库的页面骨架和现有新面试入口。
 * 关联文件：app/interview/layout.js、app/interview/new/page.js。
 * 注意事项：本页不上传或保存简历；当前文件导入仍在新面试页面。
 */
export default function ResumesPage() {
  return (
    <main className="page">
      <section className="panel workspace-placeholder-panel">
        <p className="category">简历仓库</p>
        <h1>简历仓库</h1>
        <a className="text-link" href="/interview/new">新建面试</a>
      </section>
    </main>
  );
}
