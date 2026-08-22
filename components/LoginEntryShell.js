/**
 * 文件职责：登录入口页面壳组件。
 *
 * 关联文件：
 * - components/AppEntry.js：负责在入口页壳和模拟面试主流程之间切换。
 * - app/globals.css：提供入口页背景、悬浮登录框和响应式样式。
 *
 * 说明：
 * - 本组件只做前端体验入口，不调用登录 API，不保存密码，不做账号校验。
 * - 邮箱和体验口令只存在当前组件状态中，用于轻量空输入提示。
 */
'use client';

import { useState } from 'react';

// 入口表单只做本地空输入提示，避免暗示真实账号系统已经存在。
export default function LoginEntryShell({ onEnterExperience }) {
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [entryError, setEntryError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim() || !accessCode.trim()) {
      setEntryError('请填写邮箱和体验口令；当前不会校验或保存账号信息。');
      return;
    }

    setEntryError('');
    onEnterExperience();
  };

  return (
    <main className="entry-page">
      <section className="entry-hero" aria-label="AI Interview Simulator 体验入口">
        <div className="entry-brand">
          <div className="entry-logo-mark" aria-hidden="true">
            AI
          </div>
          <div>
            <p className="entry-product-name">AI Interview Simulator</p>
            <p className="entry-product-tagline">面向求职者的 AI 模拟面试练习工具</p>
          </div>
        </div>

        <div className="entry-visual" aria-hidden="true">
          <div className="entry-visual-card">
            <div className="entry-chart">
              <span />
              <span />
              <span />
            </div>
            <div className="entry-check">✓</div>
            <div className="entry-arrow" />
          </div>
        </div>

        <form className="entry-card" onSubmit={handleSubmit} noValidate>
          <div className="entry-card-header">
            <p className="entry-eyebrow">体验版入口</p>
            <h1>进入模拟面试</h1>
            <p>粘贴岗位 JD 和简历，生成问题、提交回答，并获得结构化反馈。</p>
          </div>

          <div className="entry-field">
            <label htmlFor="entry-email">邮箱</label>
            <input
              id="entry-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setEntryError('');
              }}
              placeholder="用于进入体验版，不会创建账号"
              autoComplete="email"
            />
          </div>

          <div className="entry-field">
            <label htmlFor="entry-access-code">体验口令</label>
            <input
              id="entry-access-code"
              type="password"
              value={accessCode}
              onChange={(event) => {
                setAccessCode(event.target.value);
                setEntryError('');
              }}
              placeholder="仅用于前端演示，不会保存"
              autoComplete="off"
            />
          </div>

          {entryError && <p className="entry-error">{entryError}</p>}

          <button type="submit" className="entry-submit">
            进入体验版
          </button>

          <p className="entry-note">
            当前不进行真实登录，也不会保存或上传密码。进入后可直接使用现有模拟面试功能。
          </p>
        </form>
      </section>
    </main>
  );
}
