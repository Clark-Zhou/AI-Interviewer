/**
 * 文件职责：Next.js 全局布局文件。
 *
 * 关联文件：
 * - app/globals.css：全局 CSS 样式。
 * - app/page.js：首页内容会作为 children 渲染到这里。
 *
 * 说明：
 * - metadata 用于设置页面标题和描述。
 * - html 的 lang 设置为 zh-CN，表示当前页面主要面向中文用户。
 */
import './globals.css';

export const metadata = {
  title: 'AI Interview Simulator',
  description: 'A simple MVP for AI-powered mock interview practice.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
