/**
 * 文件职责：服务端文档解析工具。
 *
 * 关联文件：
 * - app/api/parse-document/route.js：调用这里把 PDF/DOCX 提取成纯文本。
 * - components/InterviewSimulator.js：前端通过项目内部 API 获取解析后的文本。
 *
 * 说明：
 * - 这里只做一次性纯文本提取，不保存原始文件、不做 OCR、不做 AI 自动解析。
 * - 不要在这里改 DeepSeek prompt、Supabase Auth 或本地历史记录结构。
 */
import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

function normalizeExtractedText(text) {
  return String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function parsePdfToText(buffer) {
  const parser = new PDFParse({ data: buffer });

  try {
    const result = await parser.getText();
    return normalizeExtractedText(result.text);
  } finally {
    await parser.destroy().catch(() => {});
  }
}

async function parseDocxToText(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  return normalizeExtractedText(result.value);
}

// 根据扩展名选择解析器，只返回纯文本，不返回文件名、路径或其他元数据。
export async function parseDocumentToText({ buffer, extension }) {
  if (extension === '.pdf') {
    return parsePdfToText(buffer);
  }

  if (extension === '.docx') {
    return parseDocxToText(buffer);
  }

  throw new Error('不支持的文档类型。');
}
