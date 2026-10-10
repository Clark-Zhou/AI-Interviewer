/**
 * 文件职责：提供账户页昵称和密码修改交互。
 *
 * 关联文件：
 * - app/interview/profile/account/page.js：服务端读取初始账户资料并挂载本组件。
 * - lib/userProfile.js：复用昵称展示与校验规则。
 * - lib/supabase/browserClient.js：使用当前用户会话更新 Auth metadata 和密码。
 *
 * 注意事项：密码只保留在当前组件状态中；不可读取旧密码，也不能写入 metadata、日志或本地存储。
 */
'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '../lib/supabase/browserClient';
import { getDisplayNickname, validateNickname } from '../lib/userProfile';

function AccountRow({ label, children }) {
  return (
    <div className="profile-account-row">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

// 账户页的可编辑部分独立为客户端组件，服务端页面仍以当前 Auth 会话提供初始资料。
export default function AccountSettingsPanel({ initialNickname, email, phoneStatus }) {
  const [nickname, setNickname] = useState(initialNickname);
  const [nicknameDraft, setNicknameDraft] = useState(initialNickname);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [nicknameMessage, setNicknameMessage] = useState('');

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmedPassword, setConfirmedPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const closeNicknameEditor = () => {
    setNicknameDraft(nickname);
    setNicknameError('');
    setIsEditingNickname(false);
  };

  const handleNicknameSubmit = async (event) => {
    event.preventDefault();
    const validation = validateNickname(nicknameDraft);

    if (!validation.isValid) {
      setNicknameError(validation.message);
      setNicknameMessage('');
      return;
    }

    setIsSavingNickname(true);
    setNicknameError('');
    setNicknameMessage('');

    try {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.updateUser({
        data: { nickname: validation.value },
      });

      if (error) {
        setNicknameError(error.message || '昵称修改失败，请稍后重试。');
        return;
      }

      const nextNickname = getDisplayNickname(data.user?.user_metadata?.nickname || validation.value);
      setNickname(nextNickname);
      setNicknameDraft(nextNickname);
      setNicknameMessage('昵称已更新。');
      setIsEditingNickname(false);
    } catch (error) {
      setNicknameError(error.message || '账号系统配置异常，请检查 Supabase 环境变量。');
    } finally {
      setIsSavingNickname(false);
    }
  };

  const closePasswordEditor = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmedPassword('');
    setPasswordError('');
    setIsEditingPassword(false);
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    if (!currentPassword || !newPassword || !confirmedPassword) {
      setPasswordError('请填写当前密码、新密码和确认密码。');
      setPasswordMessage('');
      return;
    }

    if (newPassword !== confirmedPassword) {
      setPasswordError('两次输入的新密码不一致。');
      setPasswordMessage('');
      return;
    }

    setIsSavingPassword(true);
    setPasswordError('');
    setPasswordMessage('');

    try {
      const supabase = createSupabaseBrowserClient();
      // Supabase 不保存可读取的密码明文；先重新验证当前密码，才能允许修改。
      const { error: verificationError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });

      if (verificationError) {
        setPasswordError('当前密码验证失败，请检查后重试。');
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      if (updateError) {
        setPasswordError(updateError.message || '密码修改失败，请稍后重试。');
        return;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmedPassword('');
      setPasswordMessage('密码已更新。');
      setIsEditingPassword(false);
    } catch (error) {
      setPasswordError(error.message || '账号系统配置异常，请检查 Supabase 环境变量。');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <dl className="profile-account-details">
      <AccountRow label="昵称">
        <div className="profile-account-value-action">
          <span>{nickname}</span>
          <button
            type="button"
            className="secondary-button compact-button profile-account-edit-button"
            onClick={() => {
              setNicknameDraft(nickname);
              setNicknameError('');
              setNicknameMessage('');
              setIsEditingNickname(true);
            }}
            disabled={isSavingNickname}
            aria-expanded={isEditingNickname}
            aria-controls="nickname-editor"
          >
            修改昵称
          </button>
        </div>
        {nicknameMessage && <p className="profile-account-message" role="status">{nicknameMessage}</p>}
        {isEditingNickname && (
          <form id="nickname-editor" className="profile-account-editor" onSubmit={handleNicknameSubmit}>
            <label htmlFor="account-nickname">昵称</label>
            <input
              id="account-nickname"
              type="text"
              value={nicknameDraft}
              onChange={(event) => {
                setNicknameDraft(event.target.value);
                setNicknameError('');
              }}
              autoComplete="nickname"
              disabled={isSavingNickname}
              aria-describedby="account-nickname-hint account-nickname-error"
            />
            <p id="account-nickname-hint" className="profile-account-hint">仅支持汉字和英文字母；最多 14 个英文字符，或 7 个汉字。</p>
            {nicknameError && <p id="account-nickname-error" className="profile-account-error" role="alert">{nicknameError}</p>}
            <div className="profile-account-editor-actions">
              <button type="submit" className="compact-button" disabled={isSavingNickname}>
                {isSavingNickname ? '正在保存...' : '保存昵称'}
              </button>
              <button type="button" className="secondary-button compact-button" onClick={closeNicknameEditor} disabled={isSavingNickname}>取消</button>
            </div>
          </form>
        )}
      </AccountRow>
      <AccountRow label="绑定邮箱"><span className="profile-account-email">{email || '未绑定'}</span></AccountRow>
      <AccountRow label="手机号"><span>{phoneStatus}</span></AccountRow>
      <AccountRow label="登录密码">
        <div className="profile-account-value-action">
          <span className="profile-password-mask" aria-label="已设置登录密码">********</span>
          <button
            type="button"
            className="secondary-button compact-button profile-account-edit-button"
            onClick={() => {
              setPasswordError('');
              setPasswordMessage('');
              setIsEditingPassword(true);
            }}
            disabled={isSavingPassword}
            aria-expanded={isEditingPassword}
            aria-controls="password-editor"
          >
            修改密码
          </button>
        </div>
        {passwordMessage && <p className="profile-account-message" role="status">{passwordMessage}</p>}
        {isEditingPassword && (
          <form id="password-editor" className="profile-account-editor" onSubmit={handlePasswordSubmit}>
            <label htmlFor="account-current-password">当前密码</label>
            <input id="account-current-password" type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" disabled={isSavingPassword} />
            <label htmlFor="account-new-password">新密码</label>
            <input id="account-new-password" type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" disabled={isSavingPassword} />
            <label htmlFor="account-confirmed-password">确认新密码</label>
            <input id="account-confirmed-password" type="password" value={confirmedPassword} onChange={(event) => setConfirmedPassword(event.target.value)} autoComplete="new-password" disabled={isSavingPassword} aria-describedby="account-password-error" />
            {passwordError && <p id="account-password-error" className="profile-account-error" role="alert">{passwordError}</p>}
            <div className="profile-account-editor-actions">
              <button type="submit" className="compact-button" disabled={isSavingPassword}>
                {isSavingPassword ? '正在修改...' : '确认修改'}
              </button>
              <button type="button" className="secondary-button compact-button" onClick={closePasswordEditor} disabled={isSavingPassword}>取消</button>
            </div>
          </form>
        )}
      </AccountRow>
    </dl>
  );
}
