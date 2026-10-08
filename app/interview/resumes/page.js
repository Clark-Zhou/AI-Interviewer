/**
 * 文件职责：展示受保护的账号简历仓库入口与列表组件。
 * 关联文件：components/ResumeLibrary.js、app/interview/new/page.js。
 * 注意事项：实际文件操作由需要再次验证 Auth 的项目 API 执行。
 */
import ResumeLibrary from '../../../components/ResumeLibrary';

export default function ResumesPage() {
  return (
    <main className="page resume-library-page">
      <section className="panel workspace-subpage-heading resume-page-heading">
        <p className="category">简历仓库</p>
        <h1>简历仓库</h1>
        <p className="subtitle">集中保存你的常用简历，让每一次针对岗位的练习更快开始。</p>
        <a className="text-link" href="/interview/new">新建面试 ↗</a>
      </section>
      <ResumeLibrary />
    </main>
  );
}
