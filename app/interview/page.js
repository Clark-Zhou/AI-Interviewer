/**
 * 文件职责：模拟面试主界面路由。
 *
 * 关联文件：
 * - components/InterviewSimulator.js：现有模拟面试主功能。
 * - app/login/page.js：体验版入口页壳路由。
 *
 * 说明：
 * - `/interview` 当前不做访问保护；本阶段不实现真实登录或鉴权。
 */
import InterviewSimulator from '../../components/InterviewSimulator';

// 面试主界面路由：复用现有模拟面试组件。
export default function InterviewPage() {
  return <InterviewSimulator />;
}
