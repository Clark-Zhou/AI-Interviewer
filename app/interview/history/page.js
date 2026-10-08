/**
 * 文件职责：受保护的本地历史记录页面。
 *
 * 关联文件：
 * - components/InterviewHistoryPanel.js：读取并展示浏览器本地历史记录。
 * - app/interview/layout.js：统一提供登录校验、账号状态和导航。
 * - app/interview/page.js：面试工作台入口页。
 *
 * 说明：
 * - `/interview/history` 的登录保护由共享布局处理。
 * - 本页只读取当前浏览器 localStorage，不做云端历史记录或数据库查询。
 */
import InterviewHistoryPanel from '../../../components/InterviewHistoryPanel';

// 历史页仍由客户端组件读取原有 localStorage 数据。
export default function InterviewHistoryPage() {
  return (
    <main className="page">
      <section className="panel workspace-subpage-heading">
        <p className="category">本地历史记录</p>
        <h1>历史记录</h1>
        <p className="subtitle">查看当前浏览器保存的模拟面试和问答详情。</p>
      </section>
      <InterviewHistoryPanel />
    </main>
  );
}
