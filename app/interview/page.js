/**
 * 文件职责：受保护的面试工作台入口页。
 *
 * 关联文件：
 * - app/interview/layout.js：统一提供登录校验和导航。
 * - app/interview/new/page.js：承载新面试完整流程。
 *
 * 说明：
 * - `/interview` 的登录保护由共享布局处理。
 * - 本页只做新建面试入口，不承载表单或历史详情。
 * - 云端历史由历史页承载；本页不做个人资料或角色权限功能。
 */
// 工作台入口只引导用户开始一轮新面试。
export default function InterviewPage() {
  return (
    <main className="page workspace-page">
      <section className="panel workspace-panel">
        <div className="workspace-hero-copy">
          <p className="category">面试工作台</p>
          <h1>为下一次面试，做好准备。</h1>
          <p className="subtitle">围绕目标岗位和你的经历，完成一轮有针对性的模拟练习。</p>
          <a className="workspace-card workspace-start-card" href="/interview/new">
            <span className="workspace-card-title">新建面试 <span aria-hidden="true">↗</span></span>
            <span className="workspace-card-description">填写岗位信息与简历，开始练习</span>
          </a>
        </div>
        <div className="workspace-hero-art" aria-hidden="true">
          <div className="workspace-art-card workspace-art-card-back" />
          <div className="workspace-art-card workspace-art-card-front">
            <span className="workspace-art-label">INTERVIEW SESSION</span>
            <span className="workspace-art-line" /><span className="workspace-art-line short" />
            <span className="workspace-art-dots"><i /><i /><i /></span>
          </div>
        </div>
      </section>
      <section className="workspace-guide" aria-labelledby="workspace-guide-title">
        <div className="workspace-guide-heading">
          <p className="category">练习流程</p>
          <h2 id="workspace-guide-title">三步完成一次模拟面试</h2>
        </div>
        <ol className="workspace-guide-grid">
          <li><span className="workspace-step-number">01</span><h3>准备 JD 与简历</h3><p>输入目标岗位信息和个人经历，让问题更贴近你的求职方向。</p></li>
          <li><span className="workspace-step-number">02</span><h3>回答 6 道问题</h3><p>逐题思考并提交回答，完整走过一轮面试练习。</p></li>
          <li><span className="workspace-step-number">03</span><h3>查看最终评价</h3><p>回看整体表现、优势和改进建议，整理下一次练习重点。</p></li>
        </ol>
      </section>
    </main>
  );
}
