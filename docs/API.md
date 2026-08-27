# API

## 文档职责

记录当前项目 API route 的请求、响应和错误边界。修改 API、请求封装、服务端解析或前后端协议时读本文件。

## POST /api/generate-questions

用途：根据岗位 JD 和简历生成 6 道结构化面试问题。

请求体：

```json
{
  "jobTitle": "岗位名称，可选",
  "jobInfo": "岗位信息文本",
  "resume": "个人简历文本"
}
```

`jobTitle` 是可选字段，旧请求不传该字段仍然可用；生成问题时只把它作为辅助上下文，不改变 6 道问题的返回协议。

成功响应：

```json
{
  "questions": [
    {
      "category": "岗位匹配",
      "question": "问题文本",
      "reason": "为什么问这个问题"
    }
  ]
}
```

错误边界：缺少 JD/简历、缺少 `DEEPSEEK_API_KEY`、DeepSeek 请求失败、AI 返回无法解析。

## POST /api/evaluate-interview

用途：根据 JD、简历、问题和已提交回答生成最终评价。

请求体：

```json
{
  "jobTitle": "岗位名称，可选",
  "jobInfo": "岗位信息文本",
  "resume": "简历文本",
  "questionAnswers": [
    {
      "category": "岗位匹配",
      "question": "问题文本",
      "reason": "提问原因",
      "answer": "用户回答"
    }
  ]
}
```

`jobTitle` 是可选字段，旧请求不传该字段仍然可用；最终评价时只把它作为辅助上下文，不改变 `evaluation` 返回协议。

成功响应：返回结构化 `evaluation`，包括总分、总结、优势、风险点、改进建议、逐题反馈和后续练习题。

错误边界：缺少输入、回答未提交完整、缺少 `DEEPSEEK_API_KEY`、DeepSeek 请求失败、AI 返回无法解析。

## POST /api/parse-document

用途：把文本型 `.pdf` / `.docx` 一次性解析成纯文本，用于回填 JD 或简历 textarea。

请求格式：`multipart/form-data`

字段：

```text
file: PDF 或 DOCX 文件
target: jobInfo | resume
```

成功响应：

```json
{
  "text": "解析出的纯文本"
}
```

错误边界：target 无效、缺少文件、扩展名不支持、文件为空、超过 5MB、文件内容和扩展名不匹配、解析失败、解析为空。

## API 边界

- 前端只调用项目自己的 API route。
- DeepSeek API Key 不进入前端。
- 原始文件不保存到 localStorage、数据库或日志。
- `/api/parse-document` 不做 OCR、图片识别、云端文件存储或 AI 自动结构化。
