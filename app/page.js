'use client';

const questions = [
  {
    category: '岗位匹配',
    question: '请结合你的经历，说明你为什么适合这个岗位？',
    reason: '用于判断你的背景和岗位要求是否匹配。',
  },
  {
    category: '项目经验',
    question: '请介绍一个最能体现你相关能力的项目。',
    reason: '用于了解你的真实参与度、贡献和解决问题的方式。',
  },
  {
    category: '技能能力',
    question: '岗位要求里的关键技能，你最熟悉哪一项？请举例说明。',
    reason: '用于验证技能是否能落到实际经验中。',
  },
  {
    category: '成长空间',
    question: '对照这个岗位，你觉得自己还需要补强什么？',
    reason: '用于观察你的自我认知和准备方向。',
  },
];

export default function Home() {
  return (
    <main className="page">
      <section className="panel">
        <h1>AI 模拟面试</h1>
        <p className="subtitle">上传岗位信息和个人简历后，生成一组模拟面试问题。</p>

        <div className="field">
          <label htmlFor="job">岗位信息</label>
          <textarea id="job" placeholder="先粘贴岗位 JD，例如职责、要求、技术栈等" />
        </div>

        <div className="field">
          <label htmlFor="resume">个人简历</label>
          <textarea id="resume" placeholder="先粘贴简历内容，例如经历、项目、技能等" />
        </div>

        <button type="button">生成示例问题</button>
      </section>

      <section className="panel preview">
        <h2>模拟问题</h2>
        <ul className="question-list">
          {questions.map((item, index) => (
            <li className="question-item" key={item.question}>
              <p className="category">
                {index + 1}. {item.category}
              </p>
              <p className="question">{item.question}</p>
              <p className="reason">{item.reason}</p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
