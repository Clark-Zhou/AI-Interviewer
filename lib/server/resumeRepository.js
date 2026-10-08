/**
 * 文件职责：简历仓库服务端的身份、文件校验、文本提取与元数据辅助逻辑。
 * 关联文件：app/api/resumes/route.js、app/api/resumes/[id]/route.js、lib/server/documentParser.js。
 * 注意事项：仅使用用户会话和 publishable key；原文件只进入私有 Storage，不写日志或历史记录。
 */
import { createSupabaseServerClient } from '../supabase/serverClient';
import { parseDocumentToText } from './documentParser';

export const RESUME_BUCKET = 'interview-resumes';
export const RESUME_LIMIT = 10;
export const RESUME_SELECT = 'id,original_name,file_type,size_bytes,created_at';
export class ResumeValidationError extends Error {}
const MAX_TEXT_SIZE = 300 * 1024;
const MAX_DOCUMENT_SIZE = 5 * 1024 * 1024;
const MIME_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  md: 'text/markdown',
};

export function resumeError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function getResumeAuth() {
  const supabase = await createSupabaseServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return { supabase, user: error ? null : user };
}

export function isResumeId(id) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export function getResumeMime(type) {
  return MIME_TYPES[type] || 'application/octet-stream';
}

export async function getOwnedResume(supabase, userId, id) {
  if (!isResumeId(id)) return null;
  const { data, error } = await supabase.from('resume_files')
    .select(`${RESUME_SELECT},storage_path`)
    .eq('id', id).eq('user_id', userId).eq('status', 'ready').maybeSingle();
  if (error) throw error;
  return data;
}

function getResumeApiToken() {
  const token = process.env.SUPABASE_RESUME_API_TOKEN;
  if (!token) throw new Error('简历仓库服务端令牌尚未配置');
  return token;
}

// 元数据写入只通过携带服务端令牌的 RPC；浏览器会话本身只有只读表权限。
export async function reserveResume(supabase, { id, name, type, size }) {
  const { error } = await supabase.rpc('reserve_resume_file', {
    resume_id: id, resume_name: name, resume_type: type,
    resume_size: size, api_token: getResumeApiToken(),
  });
  if (error) throw error;
}

export async function transitionResume(supabase, id, action) {
  const { error } = await supabase.rpc('transition_resume_file', {
    resume_id: id, action, api_token: getResumeApiToken(),
  });
  if (error) throw error;
}

// 先标记 cleanup 释放名额；对象删除失败时保留记录供以后重试。
export async function removeResumeObject(supabase, row) {
  await transitionResume(supabase, row.id, 'cleanup');
  const { error } = await supabase.storage.from(RESUME_BUCKET).remove([row.storage_path]);
  if (error) throw error;
  await transitionResume(supabase, row.id, 'purge');
}

// 清理遗留对象；单个对象故障不能阻断列表或新上传。
export async function cleanupPendingResumes(supabase, userId) {
  const cutoff = Date.now() - 30 * 60 * 1000;
  const { data, error } = await supabase.from('resume_files')
    .select('id,storage_path,status,created_at').eq('user_id', userId).in('status', ['pending', 'cleanup']);
  if (error) throw error;
  for (const row of data || []) {
    if (row.status === 'pending' && new Date(row.created_at).getTime() >= cutoff) continue;
    try {
      await removeResumeObject(supabase, row);
    } catch {
      // 网络或 Storage 故障时保留 cleanup 行，下一次请求继续重试。
    }
  }
}

function normalizedFileName(name) {
  return String(name || '').split(/[\\/]/).pop().replace(/[\u0000-\u001f\u007f]/g, '').trim();
}

// 保留现有导入尺寸，并对 PDF/DOCX 核对内容头，防止只改扩展名绕过校验。
export async function validateResumeUpload(file) {
  if (!file || typeof file.arrayBuffer !== 'function' || typeof file.size !== 'number') {
    throw new ResumeValidationError('请选择简历文件。');
  }
  const originalName = normalizedFileName(file.name);
  const type = originalName.split('.').pop()?.toLowerCase();
  if (!MIME_TYPES[type]) throw new ResumeValidationError('仅支持 PDF、DOCX、TXT 或 MD 文件。');
  if (!originalName || originalName.length > 180) throw new ResumeValidationError('文件名需在 180 个字符以内。');
  if (file.size === 0) throw new ResumeValidationError('文件内容为空，请重新选择。');
  const maxSize = type === 'pdf' || type === 'docx' ? MAX_DOCUMENT_SIZE : MAX_TEXT_SIZE;
  if (file.size > maxSize) throw new ResumeValidationError(type === 'pdf' || type === 'docx'
    ? 'PDF 或 DOCX 文件不能超过 5MB。' : 'TXT 或 MD 文件不能超过 300KB。');
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    await extractResumeText(buffer, type);
  } catch (error) {
    if (error.name === 'PasswordException') {
      throw new ResumeValidationError('PDF 有密码保护，请解除密码后再上传。');
    }
    if (error.name === 'InvalidPDFException' || error.name === 'FormatError') {
      throw new ResumeValidationError('PDF 文件结构无效或已损坏，请重新导出后上传。');
    }
    throw new ResumeValidationError(error.message?.startsWith('未提取到') || error.message?.includes('扩展名') || error.message?.includes('UTF-8')
      ? error.message : '简历解析失败；请重新导出为文本型 PDF，或使用 DOCX 上传。');
  }
  return { originalName, type, buffer };
}

export async function extractResumeText(buffer, type) {
  let content;
  if (type === 'pdf') {
    if (buffer.subarray(0, 4).toString('utf8') !== '%PDF') throw new Error('文件内容和 PDF 扩展名不匹配。');
    content = await parseDocumentToText({ buffer, extension: '.pdf' });
  } else if (type === 'docx') {
    if (buffer.subarray(0, 2).toString('utf8') !== 'PK' ||
        !buffer.includes(Buffer.from('[Content_Types].xml')) ||
        !buffer.includes(Buffer.from('word/'))) {
      throw new Error('文件内容和 DOCX 扩展名不匹配。');
    }
    content = await parseDocumentToText({ buffer, extension: '.docx' });
  } else if (type === 'txt' || type === 'md') {
    try {
      content = new TextDecoder('utf-8', { fatal: true }).decode(buffer).replace(/^\uFEFF/, '').trim();
    } catch {
      throw new Error('文本文件不是有效的 UTF-8 编码。');
    }
  } else {
    throw new Error('不支持的简历格式。');
  }
  if (!content?.trim()) throw new Error('未提取到可用文本；扫描版 PDF 暂不支持。');
  return content;
}
