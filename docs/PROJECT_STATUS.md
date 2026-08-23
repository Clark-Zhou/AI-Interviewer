# 项目当前状态

## 1. 项目目标

AI Interview Simulator 是一个个人项目，用于帮助求职者基于目标岗位信息和个人简历进行模拟面试准备。

当前 MVP 的核心目标是先跑通：

```text
岗位信息 + 个人简历 -> AI 生成面试问题 -> 用户逐题回答 -> AI 生成最终评价
```

当前已经验证核心面试练习闭环，并已完成基础主页框架、本地历史记录初始化、列表和详情查看、登录入口页面壳、`/login` 和 `/interview` 前端路由拆分、Supabase Auth 账号系统 MVP，以及内部测试版上线准备文档。根路径 `/` 现在展示登录入口、面试入口和当前登录状态；未登录用户从主页点击面试入口会进入 `/login`，直接访问 `/interview` 也仍会回到 `/login`。云端历史记录、文件上传和复杂账号能力仍暂缓。

## 2. 当前阶段

当前分支：

```text
develop-private-test-version
```

当前已经完成的是 MVP 的核心闭环、开发效率优化、基础主页框架、登录入口页面壳、入口/主界面路由拆分、Supabase Auth 账号系统 MVP 和内部测试版上线准备文档：

```text
访问根路径后看到基础主页
主页展示登录入口、面试入口和登录状态
未登录用户点击主页面试入口会进入 /login
已登录用户可以从主页进入 /interview
用户打开 /login 后先看到登录/注册入口页面壳
新用户可以使用邮箱密码注册
已注册用户可以使用邮箱密码登录
登录成功后进入 /interview 模拟面试主界面
未登录直接访问 /interview 会回到 /login
已登录用户刷新 /interview 后仍保持登录态
用户可以从主界面登出，登出后回到 /login
输入岗位信息
输入个人简历
点击生成面试问题
前端调用后端生成问题 API
后端调用 DeepSeek
后端解析 AI 返回 JSON
前端展示结构化问题列表
生成问题失败后可重试
用户逐题输入回答
用户逐题提交回答
用户一键提交全部回答
页面展示答题进度
用户开始新一轮面试并清空当前状态
开发环境可快速填入示例 JD/简历
开发环境可根据当前问题填入本地测试回答
所有回答提交后生成最终评价
前端调用后端最终评价 API
后端调用 DeepSeek
后端解析最终评价 JSON
前端展示整体评价和逐题反馈
最终评价失败后可重试
最终评价成功后保存完整本地历史记录
页面展示本地保存成功或失败提示
页面底部展示最近本地历史记录列表
点击历史记录后展示岗位摘要、简历摘要、整体评价和问答记录

开发环境独立 Mock 问题按钮
开发环境独立 Mock 评价按钮
Mock 评价复用本地历史保存机制
本地历史记录保存 AI / Mock 来源标记
内部测试版部署准备文档
生产环境变量说明
Supabase Auth URL 配置说明
部署后 smoke test 清单
内部测试用户说明和敏感信息提醒
```

## 3. 技术栈

当前技术选择：

```text
Next.js App Router
React
DeepSeek API
Supabase Auth
普通 CSS
```

当前没有使用：

```text
数据库
文件上传
Tailwind CSS
组件库
TypeScript
```

当前本地历史记录使用浏览器 `localStorage`，还没有接数据库或云端同步。

## 4. 重要文件

```text
AGENTS.md
```

项目协作规范。其他开发者或 AI agent 修改项目之前，应先阅读这个文件。

```text
docs/PRD.md
```

MVP 产品需求文档，描述产品目标、用户流程、功能范围和未来方向。当前实现以 6 道问题、逐题提交回答为准。

```text
docs/PROJECT_STATUS.md
```

当前项目状态文档，也就是本文件。用于快速了解项目已经做到哪里。一个功能分支快结束、准备 PR 前，应更新一次。

```text
docs/ROADMAP.md
```

阶段计划、优先级和验收标准文档，用于对齐产品助理、阶段开发、代码审查、开发测试等不同 session 的工作顺序。

```text
docs/DEVELOPMENT_TESTING.md
```

开发测试说明文档，记录本地开发辅助按钮、测试流程和后续 AI agent 修改边界。

```text
docs/INTERNAL_TESTING_RELEASE.md
```

内部测试版上线准备文档，记录 Vercel 部署建议、生产环境变量、Supabase Auth URL 配置、部署后 smoke test、内部测试 checklist 和敏感信息提醒。

```text
app/page.js
```

Next.js 基础主页。展示产品简短定位、登录入口、面试入口和当前登录状态；未登录用户点击主页面试入口会进入 `/login`。

```text
app/login/page.js
```

登录入口页面路由。挂载 `components/LoginEntryShell.js`，提供 Supabase Auth 邮箱密码登录和注册入口。

```text
app/interview/page.js
```

模拟面试主界面路由。服务端读取 Supabase Auth 登录态；未登录用户会回到 `/login`，已登录用户进入 `components/InterviewSimulator.js`。

```text
proxy.js
```

Supabase Auth cookie 刷新和 `/interview` 访问保护。当前匹配 `/`、`/login` 和 `/interview`，用于主页和登录页刷新认证状态，并保护面试工作区；不改 DeepSeek API 路由边界。

```text
components/LoginEntryShell.js
```

登录/注册入口页面壳。展示背景视觉、悬浮账号框、邮箱密码输入、登录/注册切换、错误提示和 loading 状态；密码不写入 localStorage、日志或历史记录。

```text
components/AuthStatusBar.js
```

账号状态条。展示当前登录邮箱并提供登出入口；登出后回到 `/login`。

```text
components/InterviewSimulator.js
```

前端主组件，负责岗位信息和简历输入、生成问题、逐题回答、逐题提交、答题进度、最终评价请求和结果展示。也包含仅开发环境显示的示例输入和测试回答填充逻辑。

```text
lib/client/interviewApi.js
```

前端请求封装。前端通过这里调用项目自己的后端 API，不能直接调用 DeepSeek。

```text
lib/client/interviewHistoryStorage.js
```

浏览器本地历史记录读写工具。最终评价生成成功后，前端通过这里把完整面试 session 保存到 localStorage；页面历史区也通过这里读取最近记录。

```text
lib/dev/interviewMocks.js
```

开发环境本地 mock 数据。提供固定结构化面试问题和固定结构最终评价，不调用后端 API，也不读取 API Key。

```text
lib/supabase/browserClient.js
```

浏览器端 Supabase Auth client。用于登录、注册和登出，只使用 publishable/anon key。

```text
lib/supabase/serverClient.js
```

服务端 Supabase Auth client。用于服务端读取当前用户和刷新 Auth cookie，不使用 `service_role` key。

```text
app/api/generate-questions/route.js
```

生成面试问题的后端 API 入口，接收前端请求，做基础校验，然后调用服务端 AI 逻辑。

```text
app/api/evaluate-interview/route.js
```

生成最终面试评价的后端 API 入口，接收岗位、简历和整场问答，做基础校验，然后调用服务端 AI 逻辑。

```text
lib/server/deepseek.js
```

生成问题的 DeepSeek 服务端调用封装。这里读取环境变量、调用 DeepSeek API，并把返回内容交给问题解析函数。

```text
lib/server/interviewEvaluation.js
```

最终评价的 DeepSeek 服务端调用封装。这里读取环境变量、调用 DeepSeek API，并把返回内容交给评价解析函数。

```text
lib/server/parseAiQuestions.js
```

AI 问题返回内容解析模块。负责把模型返回的 JSON 文本解析和校验成标准 `questions` 数组。

```text
lib/server/parseInterviewEvaluation.js
```

AI 评价返回内容解析模块。负责把模型返回的 JSON 文本解析和校验成标准 `evaluation` 对象。

```text
lib/prompts/interviewQuestions.js
```

生成面试问题的 prompt 管理文件。后续优化问题质量时优先修改这里。

```text
lib/prompts/interviewEvaluation.js
```

生成最终评价的 prompt 管理文件。后续优化评分标准、反馈结构或语气时优先修改这里。

```text
app/globals.css
```

全局样式文件。当前使用普通 CSS，不依赖 Tailwind 或 UI 组件库。

## 5. 当前数据流

生成问题链路：

```text
components/InterviewSimulator.js
  -> lib/client/interviewApi.js
  -> app/api/generate-questions/route.js
  -> lib/server/deepseek.js
  -> lib/prompts/interviewQuestions.js
  -> DeepSeek API
  -> lib/server/parseAiQuestions.js
  -> app/api/generate-questions/route.js
  -> lib/client/interviewApi.js
  -> components/InterviewSimulator.js
```

最终评价链路：

```text
components/InterviewSimulator.js
  -> lib/client/interviewApi.js
  -> app/api/evaluate-interview/route.js
  -> lib/server/interviewEvaluation.js
  -> lib/prompts/interviewEvaluation.js
  -> DeepSeek API
  -> lib/server/parseInterviewEvaluation.js
  -> app/api/evaluate-interview/route.js
  -> lib/client/interviewApi.js
  -> components/InterviewSimulator.js
```

简化理解：

```text
前端页面
-> 前端请求层
-> 后端 API route
-> DeepSeek 服务层
-> Prompt
-> AI 返回
-> JSON 解析
-> 前端展示
```

账号认证链路：

```text
components/LoginEntryShell.js
  -> lib/supabase/browserClient.js
  -> Supabase Auth 注册或登录
  -> /interview
  -> proxy.js 刷新 Auth cookie 并保护 /interview
  -> app/interview/page.js 服务端读取当前用户
  -> components/AuthStatusBar.js 提供登出入口
```

账号认证只保护前端面试工作区，不改变 DeepSeek API route 调用边界；本地历史记录仍保存在浏览器 localStorage。

## 6. 当前 API 协议

生成问题：

```http
POST /api/generate-questions
```

请求体：

```json
{
  "jobInfo": "岗位信息文本",
  "resume": "个人简历文本"
}
```

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

最终评价：

```http
POST /api/evaluate-interview
```

请求体：

```json
{
  "jobInfo": "岗位信息文本",
  "resume": "个人简历文本",
  "questionAnswers": [
    {
      "category": "岗位匹配",
      "question": "问题文本",
      "reason": "为什么问这个问题",
      "answer": "用户提交的回答"
    }
  ]
}
```

成功响应：

```json
{
  "evaluation": {
    "overallScore": 80,
    "summary": "整体评价文本",
    "strengths": ["优势 1"],
    "risks": ["风险点 1"],
    "improvementSuggestions": ["改进建议 1"],
    "questionFeedback": [
      {
        "question": "原问题文本",
        "score": 80,
        "feedback": "这道题回答得怎么样",
        "suggestion": "这道题可以如何改进"
      }
    ],
    "nextPracticeQuestions": ["建议继续练习的问题 1"]
  }
}
```

错误响应：

```json
{
  "error": "错误说明",
  "detail": "可选调试信息"
}
```

## 7. 环境变量

本地需要创建：

```text
.env.local
```

内容示例：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
```

注意：

- `.env.local` 不应提交到 git。
- `.env.example` 只能放占位值，不能放真实 key。
- `NEXT_PUBLIC_SUPABASE_URL` 必须是完整的 `http/https` URL，不能只填 Supabase project ref。
- 不要把 Supabase `service_role` key 写进 `.env.local` 或 `.env.example`。
- 修改 `.env.local` 后通常需要重启 `npm run dev`。

## 8. 本地运行方式

如果依赖还没有安装，由项目所有者自己运行：

```bash
cd /Users/a0000/personal-project/AI-Interview_Simulator
npm install
```

启动开发服务：

```bash
npm run dev
```

然后打开：

```text
http://localhost:3000
```

注意：按照 `AGENTS.md`，AI agent 不应擅自在用户电脑上安装依赖。

## 9. 已完成功能

已经完成：

- Next.js 页面结构
- 根路径 `/` 基础主页
- 主页展示登录入口、面试入口和登录状态
- 登录入口页面壳
- 背景视觉和悬浮体验框布局
- 邮箱密码注册、登录和登出
- 登录态保持
- 未登录访问 `/interview` 时回到 `/login`
- `/login` 和 `/interview` 前端路由拆分
- 未登录用户点击主页面试入口会进入 `/login`
- 登录成功后进入 `/interview` 模拟面试主界面
- 岗位信息输入框
- 个人简历输入框
- 前端空输入校验
- DeepSeek API Key 环境变量读取
- `/api/generate-questions` 后端 API
- 生成问题 DeepSeek chat completions 调用
- 生成问题失败后的 `重试生成问题` 入口
- 面试问题 prompt
- AI 问题返回 JSON 解析
- 结构化问题列表展示
- 每道题单独回答输入框
- 每道题单独提交按钮
- 一键提交全部回答
- 答题进度展示
- 开始新一轮面试
- 开始新一轮时清空当前输入、问题、回答、提交状态、评价和提示信息
- 开始新一轮时保留本地历史记录
- 开发环境填入示例 JD/简历
- 开发环境根据当前问题填入本地测试回答
- `/api/evaluate-interview` 后端 API
- 最终评价 DeepSeek chat completions 调用
- 最终评价失败后的 `重试生成评价` 入口
- 最终评价 prompt
- AI 最终评价返回 JSON 解析
- 最终评价页面展示
- 本地完整面试 session 数据结构
- `localStorage` 历史记录读写工具
- 最终评价成功后自动保存本地历史记录
- 本地保存成功 / 失败轻量提示
- 本地历史最多保留 10 条
- 最近历史记录列表
- 本地历史详情查看
- 开发环境独立 Mock 问题按钮
- 开发环境独立 Mock 评价按钮
- Mock 问题不调用后端 API
- Mock 评价不调用后端 API
- Mock 评价成功后复用本地历史保存机制
- 本地历史记录支持 `generationSource` 标记 AI / Mock 来源
- 内部测试版上线准备文档
- Vercel 部署准备说明
- 生产环境变量说明
- Supabase Auth URL 配置说明
- 内部测试 checklist
- 敏感信息提醒
- 代码分层
- 中文 file header 和关键逻辑注释
- 项目协作规范 `AGENTS.md`

## 10. 暂未完成 / 暂不做

当前 MVP 还没有做：

- 文件上传解析简历或 JD
- 恢复历史 session 到当前页面
- 历史记录删除、编辑和搜索
- 数据库或云端同步历史记录
- 用户资料页、OAuth、支付或权限系统
- 多轮追问
- 语音或视频面试
- 单题即时 AI 批改

这些功能不影响当前 MVP 主流程验证，可以在后续分支逐步做。

## 11. 下一步建议

建议下一步继续小步推进，不要一次做太大。

推荐下一步：

```text
阶段 16 已完成。下一步建议按 docs/INTERNAL_TESTING_RELEASE.md 完成外部平台部署和生产 smoke test，或启动代码审查 session 检查主页入口与登录保护。
```

建议检查：

1. 访问 `/` 是否看到基础主页，而不是直接进入 `/login`。
2. 主页是否展示 `/login` 入口和 `/interview` 入口。
3. 未登录状态下，主页是否显示未登录状态。
4. 已登录状态下，主页是否显示当前账号信息，例如邮箱。
5. 未登录时点击主页的 `/interview` 入口是否直接进入 `/login`。
6. 未登录时直接访问 `/interview` 是否也回到 `/login`。
7. 已登录时是否可以从主页进入 `/interview`。
8. `/login` 注册/登录、`/interview` 面试主流程、登出和登录态保持是否仍可用。
9. 是否没有新增云端历史、文件上传、复杂 landing page 或大范围 UI 重构。

后续可以优先考虑:

- 按 `docs/INTERNAL_TESTING_RELEASE.md` 完成外部平台部署和生产 smoke test。
- 代码审查 session 检查阶段 16 主页入口和登录保护。
- 部署后收集内部测试反馈。

不建议马上做：

- 云端历史记录和数据库存储
- 用户资料页、OAuth、支付或权限系统
- 文件上传
- 多轮追问
- 语音或视频面试
- 复杂 UI 重构

## 12. 开发约定

后续开发应遵守：

- 前端不能直接调用 DeepSeek API。
- 多 session 协作推荐按“产品助理 / 阶段开发 / 代码审查 / 开发测试”分工，阶段计划和优先级以 `docs/ROADMAP.md` 为准。
- DeepSeek API Key 只能在服务端读取。
- 新建重要代码文件需要中文 file header。
- 函数和重要逻辑块需要简短中文注释。
- 开发辅助逻辑应只在开发环境显示，不要改变正式 AI prompt。
- 依赖安装由项目所有者执行，AI agent 只提供命令和说明。
- 如果运行或测试多次失败，应先停下来讨论，不要持续枚举尝试。

**一个功能分支快结束、准备 PR 前，更新一次 PROJECT_STATUS.md。**
