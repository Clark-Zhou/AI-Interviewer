/**
 * 文件职责：受保护的面试工作台入口页。
 *
 * 关联文件：
 * - app/interview/layout.js：统一提供登录校验、账号状态和导航。
 * - app/interview/new/page.js：承载新面试完整流程。
 *
 * 说明：
 * - `/interview` 的登录保护由共享布局处理。
 * - 本页只做新建面试入口，不承载表单或历史详情。
 * - 本阶段不做云端历史记录、个人资料功能或角色权限系统。
 */
// 工作台入口只引导用户开始一轮新面试。
export default function InterviewPage() {
  return (
    <main className="page">
      <section className="panel workspace-panel">
        <div className="workspace-heading">
          <p className="category">面试工作台</p>
          <h1>准备好开始练习了吗？</h1>
          <p className="subtitle">根据岗位 JD 和简历，完成一次模拟面试并获得最终评价。</p>
        </div>

        <a className="workspace-card workspace-start-card" href="/interview/new">
          <span className="workspace-card-title">新建面试</span>
          <span className="workspace-card-description">填写岗位信息与简历，开始练习</span>
          <span className="workspace-card-arrow" aria-hidden="true">→</span>
        </a>
      </section>
    </main>
  );
}
