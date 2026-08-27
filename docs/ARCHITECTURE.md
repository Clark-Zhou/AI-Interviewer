# Architecture

## 文档职责

说明当前技术结构、目录、路由、数据流和重要文件职责。修改模块边界、路由、API 分层或数据流时读本文件。

## 技术栈

- Next.js App Router
- React
- Supabase Auth
- DeepSeek API
- mammoth / pdf-parse
- 普通 CSS

当前没有使用数据库、云端文件存储、OCR、Tailwind、组件库或 TypeScript。

## 路由结构

- `/`：主页，展示产品入口、登录/登出入口、面试入口和登录状态。
- `/login`：登录/注册入口，使用 Supabase Auth。
- `/interview`：受保护的面试工作台入口。
- `/interview/new`：受保护的新面试流程。
- `/interview/history`：受保护的本地历史记录列表和详情。
- `/api/generate-questions`：生成面试问题。
- `/api/evaluate-interview`：生成最终评价。
- `/api/parse-document`：PDF/DOCX 解析成纯文本。

## 目录结构

```text
app/                              Next.js 页面和 API route
components/                       前端组件
lib/client/                       浏览器端请求和 localStorage 工具
lib/dev/                          开发环境 Mock 数据
lib/prompts/                      DeepSeek prompt
lib/server/                       服务端 AI 调用、解析器和文档解析
lib/supabase/                     Supabase browser/server client
proxy.js                          Supabase cookie 刷新和 /interview 访问保护
docs/                             轻量项目文档
docs/archive/                     历史长文档归档，默认不读
```

## 前后端职责边界

- 前端只能调用项目自己的 API route。
- DeepSeek API Key 只能在服务端读取。
- 文档解析库 `mammoth` / `pdf-parse` 只应在服务端使用，不打进前端 bundle。
- localStorage 历史记录只在浏览器端访问。

## 核心数据流

生成问题：

```text
InterviewSimulator -> lib/client/interviewApi.js -> /api/generate-questions
-> lib/server/deepseek.js -> lib/prompts/interviewQuestions.js
-> DeepSeek -> lib/server/parseAiQuestions.js -> 前端展示
```

生成最终评价：

```text
InterviewSimulator -> lib/client/interviewApi.js -> /api/evaluate-interview
-> lib/server/interviewEvaluation.js -> lib/prompts/interviewEvaluation.js
-> DeepSeek -> lib/server/parseInterviewEvaluation.js -> 前端展示并保存历史
```

解析 PDF/DOCX：

```text
InterviewSimulator -> lib/client/interviewApi.js -> /api/parse-document
-> lib/server/documentParser.js -> mammoth 或 pdf-parse -> textarea
```

历史记录：

```text
最终评价成功 -> lib/client/interviewHistoryStorage.js
-> localStorage ai-interview-sessions -> InterviewHistoryPanel
```

## 重要文件职责

- `components/InterviewSimulator.js`：新面试主流程、导入文件、问题列表、回答提交、评价展示。
- `components/InterviewHistoryPanel.js`：本地历史列表和详情。
- `components/LoginEntryShell.js`：登录/注册页面壳。
- `components/AuthStatusBar.js`：账号状态和登出入口。
- `lib/client/interviewApi.js`：前端请求封装。
- `lib/client/interviewHistoryStorage.js`：本地历史读写。
- `lib/server/deepseek.js`：生成问题的 DeepSeek 调用。
- `lib/server/interviewEvaluation.js`：最终评价的 DeepSeek 调用。
- `lib/server/documentParser.js`：PDF/DOCX 纯文本解析。
- `lib/prompts/interviewQuestions.js`：生成问题 prompt。
- `lib/prompts/interviewEvaluation.js`：最终评价 prompt。
- `proxy.js`：Auth cookie 刷新和受保护路由拦截。
