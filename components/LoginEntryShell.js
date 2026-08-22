/**
 * 文件职责：登录入口页面壳组件。
 *
 * 关联文件：
 * - app/login/page.js：挂载本入口页壳的 `/login` 路由。
 * - app/interview/page.js：体验版入口点击后进入的 `/interview` 路由。
 * - lib/supabase/browserClient.js：浏览器端 Supabase Auth client。
 * - app/globals.css：提供入口页背景、悬浮登录框和响应式样式。
 *
 * 说明：
 * - 本组件使用 Supabase Auth 做邮箱密码登录/注册。
 * - 密码只存在当前组件状态中，不写入 localStorage、日志或历史记录。
 */
'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase/browserClient';

// 登录入口表单：复用当前视觉风格，提供最小登录/注册闭环。
export default function LoginEntryShell() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [entryError, setEntryError] = useState('');
  const [entryMessage, setEntryMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegisterMode = authMode === 'register';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      setEntryError('请填写邮箱和密码。');
      setEntryMessage('');
      return;
    }

    setIsSubmitting(true);
    setEntryError('');
    setEntryMessage('');

    const supabase = createSupabaseBrowserClient();

    if (isRegisterMode) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      setIsSubmitting(false);

      if (error) {
        setEntryError(error.message || '注册失败，请检查邮箱和密码后重试。');
        return;
      }

      if (data.session) {
        router.push('/interview');
        router.refresh();
        return;
      }

      setEntryMessage('注册申请已提交。请检查邮箱完成确认后，再返回这里登录。');
      setAuthMode('login');
      setPassword('');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setEntryError(error.message || '登录失败，请检查邮箱和密码后重试。');
      return;
    }

    router.push('/interview');
    router.refresh();
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
            <p className="entry-eyebrow">账号入口</p>
            <h1>{isRegisterMode ? '注册账号' : '登录账号'}</h1>
            <p>登录后进入模拟面试工作区，继续生成问题、提交回答并获得结构化反馈。</p>
          </div>

          <div className="entry-mode-switch" aria-label="账号入口模式">
            <button
              type="button"
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => {
                setAuthMode('login');
                setEntryError('');
                setEntryMessage('');
              }}
            >
              登录
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => {
                setAuthMode('register');
                setEntryError('');
                setEntryMessage('');
              }}
            >
              注册
            </button>
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
                setEntryMessage('');
              }}
              placeholder="请输入注册或登录邮箱"
              autoComplete="email"
              disabled={isSubmitting}
            />
          </div>

          <div className="entry-field">
            <label htmlFor="entry-password">密码</label>
            <input
              id="entry-password"
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setEntryError('');
                setEntryMessage('');
              }}
              placeholder="请输入密码"
              autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
              disabled={isSubmitting}
            />
          </div>

          {entryError && <p className="entry-error">{entryError}</p>}
          {entryMessage && <p className="entry-message">{entryMessage}</p>}

          <button type="submit" className="entry-submit" disabled={isSubmitting}>
            {isSubmitting
              ? isRegisterMode ? '正在注册...' : '正在登录...'
              : isRegisterMode ? '注册并进入' : '登录并进入'}
          </button>

          <p className="entry-note">
            当前账号系统使用 Supabase Auth。密码不会写入本地历史记录或自定义存储。
          </p>
        </form>
      </section>
    </main>
  );
}
