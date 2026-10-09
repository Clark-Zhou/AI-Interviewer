/**
 * 文件职责：为个人中心及账户页展示统一的默认头像。
 * 关联文件：app/interview/profile/page.js、app/interview/profile/account/page.js。
 * 注意事项：当前没有头像存储，图形仅作装饰，不从邮箱推断身份。
 */
export default function ProfileAvatar() {
  return (
    <span className="profile-avatar" aria-hidden="true">
      <svg viewBox="0 0 80 80" fill="none" aria-hidden="true">
        <circle cx="40" cy="31" r="13" fill="currentColor" opacity=".92" />
        <path d="M16 68c2-15 11-23 24-23s22 8 24 23" fill="currentColor" opacity=".92" />
      </svg>
    </span>
  );
}
