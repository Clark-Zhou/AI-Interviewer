/**
 * 文件职责：受保护的新面试流程页面。
 *
 * 关联文件：
 * - components/InterviewSimulator.js：承载新面试完整流程。
 * - app/interview/layout.js：统一提供登录校验和导航。
 * - app/interview/page.js：面试工作台入口页。
 *
 * 说明：
 * - `/interview/new` 的登录保护由共享布局处理。
 * - 本页复用现有新面试流程，不改 DeepSeek API、prompt 或历史记录数据结构。
 */
import InterviewSimulator from '../../../components/InterviewSimulator';
// 新面试页面复用原有完整流程，外层由共享布局提供导航和登录校验。
export default function NewInterviewPage() {
  return <InterviewSimulator />;
}
