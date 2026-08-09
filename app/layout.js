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
