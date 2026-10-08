/**
 * 文件职责：受保护的云端历史记录页面。
 *
 * 关联文件：
 * - components/InterviewHistoryPanel.js：读取并展示当前账号的云端历史记录。
 * - app/interview/layout.js：统一提供登录校验和导航。
 * - app/interview/page.js：面试工作台入口页。
 *
 * 说明：
 * - `/interview/history` 的登录保护由共享布局处理。
 * - 共享布局负责登录保护；客户端面板通过项目 API 读取云端数据。
 */
import InterviewHistoryPanel from '../../../components/InterviewHistoryPanel';

// 客户端组件按需分页读取云端；旧本地记录只用于手动导入。
export default function InterviewHistoryPage() {
  return (
    <main className="page">
      <section className="panel workspace-subpage-heading">
        <p className="category">我的面试档案</p>
        <h1>历史记录</h1>
        <p className="subtitle">查看当前账号保存的模拟面试、问答与评价。</p>
      </section>
      <InterviewHistoryPanel />
    </main>
  );
}
