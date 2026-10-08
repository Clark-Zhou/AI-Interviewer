/**
 * 文件职责：封装面试输入区的浏览器端文件识别、校验和文本读取。
 *
 * 关联文件：
 * - components/InterviewSimulator.js：处理导入后的页面状态与过期结果。
 * - lib/client/interviewApi.js：PDF/DOCX 仍通过项目后端 API 解析。
 *
 * 注意事项：仅在浏览器端使用；文本文件不上传，文档文件不在此处解析。
 */

const MAX_TEXT_IMPORT_SIZE_BYTES = 300 * 1024;
const MAX_DOCUMENT_IMPORT_SIZE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_TEXT_FILE_EXTENSIONS = ['.txt', '.md'];
const SUPPORTED_DOCUMENT_FILE_EXTENSIONS = ['.pdf', '.docx'];

export const IMPORT_FILE_ACCEPT =
  '.txt,.md,.pdf,.docx,text/plain,text/markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document';

// 使用扩展名沿用现有文件分类规则，避免 MIME 类型缺失时拒绝可用文件。
export function getInterviewImportKind(file) {
  const fileName = file.name.toLowerCase();

  if (SUPPORTED_TEXT_FILE_EXTENSIONS.some((extension) => fileName.endsWith(extension))) {
    return 'text';
  }

  if (SUPPORTED_DOCUMENT_FILE_EXTENSIONS.some((extension) => fileName.endsWith(extension))) {
    return 'document';
  }

  return '';
}

// 保持现有大小限制和错误文案；返回空字符串表示可以继续读取或解析。
export function getInterviewImportValidationError(file, kind) {
  if (kind === 'text') {
    if (file.size === 0) {
      return '文件内容为空，请选择包含文本的 .txt 或 .md 文件。';
    }

    if (file.size > MAX_TEXT_IMPORT_SIZE_BYTES) {
      return '文件过大，请选择 300KB 以内的 .txt 或 .md 文本文件。';
    }

    return '';
  }

  if (kind === 'document') {
    if (file.size === 0) {
      return '文件内容为空，请重新选择文件。';
    }

    if (file.size > MAX_DOCUMENT_IMPORT_SIZE_BYTES) {
      return '文件过大，请选择 5MB 以内的 PDF 或 DOCX 文件。';
    }

    return '';
  }

  return '仅支持导入 .txt、.md、.pdf 或 .docx 文件。';
}

// 本地读取文本，不保存文件对象或元数据；过期结果由调用组件判断。
export function readInterviewTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('文件读取失败，请重新选择文件或手动粘贴文本。'));
    };

    reader.onload = () => {
      const fileText = typeof reader.result === 'string' ? reader.result : '';

      if (!fileText.trim()) {
        reject(new Error('文件内容为空，请选择包含文本的 .txt 或 .md 文件。'));
        return;
      }

      resolve(fileText);
    };

    reader.readAsText(file);
  });
}
