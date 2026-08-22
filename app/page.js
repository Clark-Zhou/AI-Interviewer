/**
 * 文件职责：首页入口文件。
 *
 * 关联文件：
 * - components/AppEntry.js：控制登录入口页壳和模拟面试主流程之间的前端切换。
 * - app/layout.js：页面外层 HTML 结构和全局样式入口。
 *
 * 说明：
 * - 这个文件尽量保持简单，只负责把应用入口组件挂到首页。
 */
import AppEntry from '../components/AppEntry';

// 首页只负责挂载应用入口组件，具体交互逻辑放到 components 里。
export default function Home() {
  return <AppEntry />;
}
