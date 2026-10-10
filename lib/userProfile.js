/**
 * 文件职责：统一处理用户昵称的默认展示与格式校验。
 *
 * 关联文件：
 * - components/LoginEntryShell.js：注册时校验并保存昵称。
 * - components/AccountSettingsPanel.js：账户页修改昵称。
 * - app/interview/profile/page.js：个人中心总览展示昵称。
 *
 * 注意事项：昵称保存在 Supabase Auth 的 user_metadata 中，仅用于展示，不能用于权限判断。
 */

export const DEFAULT_NICKNAME = '面试用户';

// 汉字按 2 个单位、英文字母按 1 个单位计算，以统一注册和账户页的长度边界。
function getNicknameUnits(value) {
  return Array.from(value).reduce((total, character) => (
    total + (/\p{Script=Han}/u.test(character) ? 2 : 1)
  ), 0);
}

export function validateNickname(value) {
  if (typeof value !== 'string' || !value.trim()) {
    return { isValid: false, message: '请填写昵称。' };
  }

  if (value !== value.trim() || !/^(?:\p{Script=Han}|[A-Za-z])+$/u.test(value)) {
    return { isValid: false, message: '昵称仅支持汉字和英文字母。' };
  }

  if (getNicknameUnits(value) > 14) {
    return { isValid: false, message: '昵称最多 14 个英文字符，或 7 个汉字。' };
  }

  return { isValid: true, value };
}

// 历史账号和异常 metadata 都回退为统一默认昵称，避免页面显示空值或无效资料。
export function getDisplayNickname(value) {
  const result = validateNickname(value);
  return result.isValid ? result.value : DEFAULT_NICKNAME;
}
