# Architecture

## 文档职责

说明当前技术结构、目录、路由、数据流和重要文件职责。

## 技术栈

- Next.js App Router
- React
- Supabase Auth
- DeepSeek API
- mammoth / pdf-parse
- 普通 CSS

仅简历仓库使用 Supabase 数据表与私有 Storage；历史记录仍在浏览器 localStorage。当前没有 OCR、Tailwind、组件库或 TypeScript。

## 路由结构

- `/`：主页，展示产品入口、登录/登出入口、面试入口和登录状态。
- `/login`：登录/注册入口，使用 Supabase Auth。
- `/interview`：受保护的面试工作台入口。
- `/interview/new`：受保护的新面试流程。
- `/interview/history`：受保护的本地历史记录列表和详情。
- `/interview/resumes`：受保护的简历仓库。
- `/interview/analytics`：受保护的数据和分析页面骨架。
- `/interview/profile`：受保护的个人中心，服务端读取当前用户并展示邮箱与登出。
- `/api/generate-questions`：生成面试问题。
- `/api/evaluate-interview`：生成最终评价。
- `/api/parse-document`：PDF/DOCX 解析成纯文本。
- `/api/resumes` 及 `/api/resumes/[id]` 子路由：当前用户的简历列表、上传、删除、下载与文本提取。

## 目录结构

```text
app/                              Next.js 页面和 API route
components/                       前端组件
lib/client/                       浏览器端请求、文件导入和 localStorage 工具
lib/dev/                          开发环境 Mock 数据
lib/prompts/                      DeepSeek prompt
lib/server/                       服务端 AI 调用、解析器和文档解析
lib/supabase/                     Supabase browser/server client
proxy.js                          Supabase cookie 刷新和 /interview 访问保护
docs/                             按主题拆分的长期文档
docs/tasks/                       单项较大任务记录与未完成任务索引
docs/templates/                   任务记录和 session 提示词模板
docs/archive/                     既有历史资料
```

## 前后端职责边界

- 前端只能调用项目自己的 API route。
- DeepSeek API Key 只能在服务端读取。
- 文档解析库 `mammoth` / `pdf-parse` 只应在服务端使用，不打进前端 bundle。
- localStorage 历史记录只在浏览器端访问。
- 简历原文件保存到私有 `interview-resumes` Storage 桶；`public.resume_files` 记录当前账号的文件元数据及上传状态，数据库触发器在并发插入时限制每账号最多 10 份。仓库 API 自行校验 Auth，仅使用用户会话与 publishable key；Storage 和表都以 RLS 隔离账号。
- `app/interview/layout.js` 集中校验登录态并承载品牌页头、五入口导航和离开保护；`proxy.js` 仍保护整个 `/interview/:path*`。面试区页面共用约 1200px 的响应式容器，视觉样式限制在 `.interview-shell` 内。
- `app/interview/profile/page.js` 服务端读取当前用户，独占挂载 `AuthStatusBar`；其他面试区页面不展示邮箱或登出。
- 面试区页面链接使用原生跳转，使浏览器 `beforeunload` 可以提醒未完成面试；登出在个人中心的账号卡片显示页面内确认。

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
InterviewSimulator -> lib/client/interviewFileImport.js（分类与大小校验）
-> lib/client/interviewApi.js -> /api/parse-document
-> lib/server/documentParser.js -> mammoth 或 pdf-parse -> textarea
```

导入 TXT/MD：

```text
InterviewSimulator -> lib/client/interviewFileImport.js（分类、大小校验与本地读取）
-> textarea；组件检查导入结果是否过期并清空旧面试结果
```

历史记录：

```text
最终评价成功 -> lib/client/interviewHistoryStorage.js
-> localStorage ai-interview-sessions -> InterviewHistoryPanel
```

简历仓库：

```text
ResumeLibrary -> /api/resumes -> 校验及提取文本 -> resume_files 预留名额
-> 私有 Storage 保存原文件 -> 元数据置为 ready
ResumePicker -> /api/resumes/[id]/content -> 私有 Storage 下载并解析 -> 新面试 textarea
```

## 重要文件职责

- `components/InterviewSimulator.js`：新面试主流程、导入文件、问题列表、回答提交、评价展示。
- `components/InterviewHistoryPanel.js`：本地历史列表和详情。
- `components/ResumeLibrary.js`、`components/ResumePicker.js`：云端简历列表与新面试选择。
- `components/LoginEntryShell.js`：登录/注册页面壳。
- `components/AuthStatusBar.js`：个人中心的账号状态和登出入口。
- `components/InterviewNavigation.js`：五入口导航与当前区域高亮。
- `components/InterviewLeaveGuard.js`：未保存面试的浏览器离开提示与登出确认状态。
- `lib/client/interviewApi.js`：前端请求封装。
- `lib/client/interviewHistoryStorage.js`：本地历史读写。
- `lib/client/interviewFileImport.js`：浏览器端文件识别、大小校验和文本读取。
- `lib/server/deepseek.js`：生成问题的 DeepSeek 调用。
- `lib/server/interviewEvaluation.js`：最终评价的 DeepSeek 调用。
- `lib/server/documentParser.js`：PDF/DOCX 纯文本解析。
- `lib/server/resumeRepository.js`：简历服务端校验、解析与账号元数据辅助逻辑。
- `lib/prompts/interviewQuestions.js`：生成问题 prompt。
- `lib/prompts/interviewEvaluation.js`：最终评价 prompt。
- `proxy.js`：Auth cookie 刷新和受保护路由拦截。
