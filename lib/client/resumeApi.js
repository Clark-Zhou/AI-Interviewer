/**
 * 文件职责：封装浏览器到项目简历仓库 API 的请求。
 * 关联文件：components/ResumeLibrary.js、components/ResumePicker.js、app/api/resumes/。
 * 注意事项：不直接调用 Supabase Storage；所有请求由项目 API 验证登录用户。
 */
async function readError(response, fallback) {
  const data = await response.json().catch(() => ({}));
  return new Error(data.error || fallback);
}

export async function listResumes() {
  const response = await fetch('/api/resumes', { cache: 'no-store' });
  if (!response.ok) throw await readError(response, '简历列表读取失败。');
  const data = await response.json();
  return Array.isArray(data.resumes) ? data.resumes : [];
}

export async function uploadResume(file) {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/resumes', { method: 'POST', body });
  if (!response.ok) throw await readError(response, '简历上传失败。');
  return (await response.json()).resume;
}

export async function deleteResume(id) {
  const response = await fetch(`/api/resumes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  if (!response.ok) throw await readError(response, '删除失败。');
}

export async function downloadResume(id) {
  const response = await fetch(`/api/resumes/${encodeURIComponent(id)}/download`, { cache: 'no-store' });
  if (!response.ok) throw await readError(response, '下载失败。');
  return response.blob();
}

export async function getResumeText(id) {
  const response = await fetch(`/api/resumes/${encodeURIComponent(id)}/content`, { cache: 'no-store' });
  if (!response.ok) throw await readError(response, '简历读取失败。');
  const data = await response.json();
  if (typeof data.text !== 'string' || !data.text.trim()) throw new Error('仓库没有返回可用的简历文本。');
  return data.text;
}
