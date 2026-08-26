/**
 * 文件职责：PDF/DOCX 文档解析 API 入口。
 *
 * 关联文件：
 * - lib/server/documentParser.js：真正执行 PDF/DOCX 纯文本提取。
 * - lib/client/interviewApi.js：前端通过这里封装的方法请求本 API。
 * - components/InterviewSimulator.js：把解析后的文本填入 JD 或简历 textarea。
 *
 * 说明：
 * - 这里只做一次性解析并返回纯文本，不保存原始文件、不写入数据库或 localStorage。
 * - 本阶段不做 OCR、图片识别、云端文件管理或 AI 自动结构化。
 */
import { parseDocumentToText } from '../../../lib/server/documentParser';

export const runtime = 'nodejs';

const MAX_DOCUMENT_PARSE_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_DOCUMENT_EXTENSIONS = ['.pdf', '.docx'];
const SUPPORTED_TARGETS = ['jobInfo', 'resume'];

function getFileExtension(fileName) {
  const normalizedFileName = String(fileName || '').toLowerCase();
  const dotIndex = normalizedFileName.lastIndexOf('.');

  if (dotIndex === -1) {
    return '';
  }

  return normalizedFileName.slice(dotIndex);
}

function isFormDataFile(value) {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof value.arrayBuffer === 'function' &&
    typeof value.size === 'number',
  );
}

function isPdfBuffer(buffer) {
  return buffer.subarray(0, 4).toString('utf8') === '%PDF';
}

function isDocxBuffer(buffer) {
  const hasZipHeader = buffer.subarray(0, 2).toString('utf8') === 'PK';
  const hasContentTypes = buffer.includes(Buffer.from('[Content_Types].xml'));
  const hasWordDocument = buffer.includes(Buffer.from('word/'));

  return hasZipHeader && hasContentTypes && hasWordDocument;
}

// 文件名只用于选择解析器，真正解析前还要做轻量文件内容校验。
function isSupportedDocumentContent(buffer, extension) {
  if (extension === '.pdf') {
    return isPdfBuffer(buffer);
  }

  if (extension === '.docx') {
    return isDocxBuffer(buffer);
  }

  return false;
}

// 后端入口：接收单个 PDF/DOCX 文件，解析成纯文本后立即返回给前端。
export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const target = formData.get('target');

    if (!SUPPORTED_TARGETS.includes(target)) {
      return Response.json(
        { error: '文档解析目标无效。' },
        { status: 400 },
      );
    }

    if (!isFormDataFile(file)) {
      return Response.json(
        { error: '请提供需要解析的 PDF 或 DOCX 文件。' },
        { status: 400 },
      );
    }

    const extension = getFileExtension(file.name);

    if (!SUPPORTED_DOCUMENT_EXTENSIONS.includes(extension)) {
      return Response.json(
        { error: '仅支持解析 .pdf 或 .docx 文件。' },
        { status: 400 },
      );
    }

    if (file.size === 0) {
      return Response.json(
        { error: '文件内容为空，请重新选择文件。' },
        { status: 400 },
      );
    }

    if (file.size > MAX_DOCUMENT_PARSE_FILE_SIZE_BYTES) {
      return Response.json(
        { error: '文件过大，请选择 5MB 以内的 PDF 或 DOCX 文件。' },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isSupportedDocumentContent(buffer, extension)) {
      return Response.json(
        { error: '文件内容和扩展名不匹配，请选择有效的 PDF 或 DOCX 文件。' },
        { status: 400 },
      );
    }

    const text = await parseDocumentToText({ buffer, extension });

    if (!text) {
      return Response.json(
        {
          error: '没有解析到可用文本。扫描版 PDF 或图片型文件暂不支持，请复制粘贴文本或换文本型文件。',
        },
        { status: 422 },
      );
    }

    return Response.json({ text });
  } catch (error) {
    const fallbackMessage = '文档解析失败，请确认文件未损坏，或改用复制粘贴文本。';
    const message = error.message?.startsWith('文档解析失败')
      ? error.message
      : fallbackMessage;

    return Response.json(
      {
        error: message,
      },
      { status: error.status || 500 },
    );
  }
}
