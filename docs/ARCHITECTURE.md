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

简历仓库使用 Supabase 数据表与私有 Storage；面试历史使用账号隔离的 Supabase 数据表。旧本地历史仅在手动导入时读取。当前没有 OCR、Tailwind、组件库或 TypeScript。

## 路由结构

- `/`：主页，展示产品入口、登录/登出入口、面试入口和登录状态。
- `/login`：登录/注册入口，使用 Supabase Auth。
- `/interview`：受保护的面试工作台入口。
- `/interview/new`：受保护的新面试流程。
- `/interview/history`：受保护的云端历史记录列表和详情。
- `/interview/resumes`：受保护的简历仓库。
- `/interview/analytics`：受保护的数据和分析页面骨架。
- `/interview/profile`：受保护的个人中心，服务端读取当前用户并展示邮箱与登出。
- `/api/generate-questions`：生成面试问题。
- `/api/evaluate-interview`：生成最终评价。
- `/api/parse-document`：PDF/DOCX 解析成纯文本。
- `/api/resumes` 及 `/api/resumes/[id]` 子路由：当前用户的简历列表、上传、删除、下载与文本提取。
- `/api/history`、`/api/history/[id]`、`/api/history/import`：当前账号的面试历史保存、分页、详情、删除与旧记录手动导入。

## 目录结构

```text
app/                              Next.js 页面和 API route
components/                       前端组件
lib/client/                       浏览器端请求、文件导入和旧历史 localStorage 读取工具
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
- 新面试和历史页只通过项目 API 读写云端历史；旧 `localStorage` 历史只在浏览器端供手动导入读取，不再自动写入。
- `public.interview_sessions` 存储完整历史 JSON、列表字段和可选的旧本地 ID；RLS 按当前 Supabase 用户限制读写。新历史由服务端确认写入后才解除离开提醒；旧记录按账号和本地 ID 去重。
- 简历原文件保存到私有 `interview-resumes` Storage 桶；`public.resume_files` 记录当前账号的文件元数据及上传状态。服务端凭当前用户会话及私有令牌调用受控 RPC，数据库以账号级事务锁限制并发预留最多 10 份。表只向登录用户开放自己的只读数据；Storage RLS 限制预留路径上传及清理状态删除。上传/删除的对象清理失败会留下不占名额的 `cleanup` 记录，后续请求重试。
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
最终评价成功 -> lib/client/interviewHistoryApi.js -> /api/history
-> public.interview_sessions -> InterviewHistoryPanel 分页和详情
旧浏览器 localStorage -> 用户确认 -> /api/history/import -> 当前账号
```

简历仓库：

```text
ResumeLibrary -> /api/resumes -> 校验及提取文本 -> resume_files 预留名额
-> 私有 Storage 保存原文件 -> 元数据置为 ready
ResumePicker -> /api/resumes/[id]/content -> 私有 Storage 下载并解析 -> 新面试 textarea
```

## 重要文件职责

- `components/InterviewSimulator.js`：新面试主流程、导入文件、问题列表、回答提交、评价展示。
- `components/InterviewHistoryPanel.js`：云端历史列表、详情、删除及旧记录手动导入。
- `components/ResumeLibrary.js`、`components/ResumePicker.js`：云端简历列表与新面试选择。
- `components/LoginEntryShell.js`：登录/注册页面壳。
- `components/AuthStatusBar.js`：个人中心的账号状态和登出入口。
- `components/InterviewNavigation.js`：五入口导航与当前区域高亮。
- `components/InterviewLeaveGuard.js`：未保存面试的浏览器离开提示与登出确认状态。
- `lib/client/interviewApi.js`：前端请求封装。
- `lib/client/interviewHistoryApi.js`：云端历史请求封装；`lib/client/interviewHistoryStorage.js`：旧本地历史读取，保留原数据。
- `lib/client/interviewFileImport.js`：浏览器端文件识别、大小校验和文本读取。
- `lib/server/deepseek.js`：生成问题的 DeepSeek 调用。
- `lib/server/interviewEvaluation.js`：最终评价的 DeepSeek 调用。
- `lib/server/documentParser.js`：PDF/DOCX 纯文本解析。
- `lib/server/resumeRepository.js`：简历服务端校验、解析与账号元数据辅助逻辑。
- `lib/prompts/interviewQuestions.js`：生成问题 prompt。
- `lib/prompts/interviewEvaluation.js`：最终评价 prompt。
- `proxy.js`：Auth cookie 刷新和受保护路由拦截。
