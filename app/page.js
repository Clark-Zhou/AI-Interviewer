/**
 * 文件职责：首页入口文件。
 *
 * 关联文件：
 * - components/InterviewSimulator.js：实际的模拟面试页面组件。
 * - app/layout.js：页面外层 HTML 结构和全局样式入口。
 *
 * 说明：
 * - 这个文件尽量保持简单，只负责把主功能组件挂到首页。
 */
import InterviewSimulator from '../components/InterviewSimulator';

// 首页只负责挂载主功能组件，具体交互逻辑放到 components 里。
export default function Home() {
  return <InterviewSimulator />;
}
