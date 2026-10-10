/**
 * 文件职责：登录入口页面壳组件。
 *
 * 关联文件：
 * - app/login/page.js：挂载本入口页壳的 `/login` 路由。
 * - app/page.js：登录或注册成功后返回的主页路由。
 * - app/interview/page.js：登录后可从主页进入的受保护模拟面试路由。
 * - lib/supabase/browserClient.js：浏览器端 Supabase Auth client。
 * - app/globals.css：提供入口页背景、悬浮登录框和响应式样式。
 *
 * 说明：
 * - 本组件使用 Supabase Auth 做邮箱密码登录/注册。
 * - 密码只存在当前组件状态中，不写入 localStorage、日志或历史记录。
 */
'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase/browserClient';
import { validateNickname } from '../lib/userProfile';

// 登录入口表单：复用当前视觉风格，提供最小登录/注册闭环。
export default function LoginEntryShell() {
  const [authMode, setAuthMode] = useState('login');
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [entryError, setEntryError] = useState('');
  const [nicknameError, setNicknameError] = useState('');
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

    if (isRegisterMode) {
      const nicknameValidation = validateNickname(nickname);
      if (!nicknameValidation.isValid) {
        setNicknameError(nicknameValidation.message);
        setEntryError('');
        setEntryMessage('');
        return;
      }

      setNicknameError('');
    }

    setIsSubmitting(true);
    setEntryError('');
    setEntryMessage('');

    let supabase;

    try {
      supabase = createSupabaseBrowserClient();
    } catch (error) {
      setIsSubmitting(false);
      setEntryError(error.message || '账号系统配置异常，请检查 Supabase 环境变量。');
      return;
    }

    if (isRegisterMode) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { nickname },
        },
      });

      setIsSubmitting(false);

      if (error) {
        setEntryError(error.message || '注册失败，请检查邮箱和密码后重试。');
        return;
      }

      if (data.session) {
        // 等会话写入 cookie 后整页请求主页，避免客户端导航读取旧的未登录视图。
        window.location.replace('/');
        return;
      }

      setEntryMessage('注册申请已提交。请检查邮箱完成确认后，再返回这里登录。');
      setAuthMode('login');
      setPassword('');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error || !data?.session) {
        setEntryError(error?.message || '登录失败，请检查邮箱和密码后重试。');
        return;
      }

      // 登录成功后用独立请求验证 cookie 已被服务端读取，避免跳转后误显未登录。
      const sessionResponse = await fetch('/api/auth/session', {
        method: 'POST',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ expectedUserId: data.user.id }),
      });
      const sessionResult = await sessionResponse.json();

      if (sessionResult.status === 'unavailable') {
        // 会话已由浏览器保存；主页会展示服务暂不可用和重试入口。
        window.location.replace('/');
        return;
      }

      if (sessionResult.status === 'mismatch') {
        setEntryError('登录账号与当前浏览器会话不一致，请刷新页面后重试。');
        return;
      }

      if (!sessionResponse.ok || sessionResult.status !== 'authenticated') {
        setEntryError('登录已完成，但浏览器未保留登录状态。请检查 Cookie 设置后重试。');
        return;
      }

      window.location.replace('/');
    } catch {
      setEntryError('登录暂时不可用，请检查网络后重试。');
    } finally {
      setIsSubmitting(false);
    }
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
            <p>登录后返回主页，再从主页进入模拟面试工作区。</p>
          </div>

          <div className="entry-mode-switch" aria-label="账号入口模式">
            <button
              type="button"
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => {
                setAuthMode('login');
                setEntryError('');
                setNicknameError('');
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
                setNicknameError('');
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

          {isRegisterMode && (
            <div className="entry-field">
              <label htmlFor="entry-nickname">昵称</label>
              <input
                id="entry-nickname"
                type="text"
                value={nickname}
                onChange={(event) => {
                  setNickname(event.target.value);
                  setNicknameError('');
                  setEntryMessage('');
                }}
                placeholder="最多 7 个汉字或 14 个英文字母"
                autoComplete="nickname"
                disabled={isSubmitting}
                aria-invalid={Boolean(nicknameError)}
                aria-describedby={nicknameError ? 'entry-nickname-hint entry-nickname-error' : 'entry-nickname-hint'}
              />
              <p id="entry-nickname-hint" className="entry-field-hint">仅支持汉字和英文字母。</p>
              {nicknameError && <p id="entry-nickname-error" className="entry-error" role="alert">{nicknameError}</p>}
            </div>
          )}

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

          {entryError && <p className="entry-error" role="alert">{entryError}</p>}
          {entryMessage && <p className="entry-message">{entryMessage}</p>}

          <button type="submit" className="entry-submit" disabled={isSubmitting}>
            {isSubmitting
              ? isRegisterMode ? '正在注册...' : '正在登录...'
              : isRegisterMode ? '注册并返回主页' : '登录并返回主页'}
          </button>

          <p className="entry-note">
            当前账号系统使用 Supabase Auth。密码不会写入本地历史记录或自定义存储。
          </p>
        </form>
      </section>
    </main>
  );
}
