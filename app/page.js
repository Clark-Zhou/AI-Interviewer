import InterviewSimulator from '../components/InterviewSimulator';

// 首页只负责挂载主功能组件，具体交互逻辑放到 components 里。
export default function Home() {
  return <InterviewSimulator />;
}
