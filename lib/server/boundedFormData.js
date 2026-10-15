/**
 * 文件职责：读取 multipart 请求并在解析前限制实际字节数。
 * 关联文件：文档解析和简历仓库上传 API。
 * 注意事项：不信任可省略的 Content-Length；读取后才构建受限 Request。
 */
export class MultipartLimitError extends Error {}

export async function readBoundedFormData(request, maxBytes) {
  const declaredSize = Number(request.headers.get('content-length'));
  if (declaredSize > maxBytes) throw new MultipartLimitError('请求内容过大。');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('请求内容为空。');
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      throw new MultipartLimitError('请求内容过大。');
    }
    chunks.push(value);
  }
  const boundedRequest = new Request(request.url, {
    method: 'POST',
    headers: { 'content-type': request.headers.get('content-type') || '' },
    body: Buffer.concat(chunks),
  });
  return boundedRequest.formData();
}
