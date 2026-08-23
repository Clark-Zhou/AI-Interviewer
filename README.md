# AI Interview Simulator

> 文档职责：这是项目的入口说明文档，帮助第一次打开仓库的人快速了解项目目标、当前功能、运行方式、目录结构和开发测试流程。

AI Interview Simulator 是一个个人 MVP 项目，用于帮助求职者基于目标岗位信息和个人简历进行模拟面试准备。

当前核心流程：

```text
岗位信息 + 个人简历 -> AI 生成面试问题 -> 用户逐题回答 -> AI 生成最终评价
```

当前版本先验证最小可用闭环。当前已完成本地历史记录初始化、列表和详情查看、登录入口页面壳、`/login` 和 `/interview` 路由拆分、Supabase Auth 账号系统 MVP，以及内部测试版上线准备文档。云端历史记录、文件上传、语音或视频面试仍暂缓。

## 当前功能

已经完成：

- 登录入口页面壳
- `/login` 和 `/interview` 前端路由拆分
- 邮箱密码注册、登录和登出
- 登录态保持
- 未登录访问 `/interview` 时回到 `/login`
- 登录成功后进入 `/interview` 模拟面试主界面
- 输入岗位 JD
- 输入个人简历
- 前端空输入校验
- 调用后端 API 生成 6 道结构化面试问题
- 生成问题失败后显示错误提示，并可重试生成问题
- 展示问题分类、问题文本和提问原因
- 每道题单独填写回答
- 每道题单独提交回答
- 一键提交全部回答
- 展示答题进度
- 所有回答提交后生成最终评价
- 最终评价失败后显示错误提示，并可重试生成评价
- 展示总分、总结、优势、风险点、改进建议、逐题反馈和后续练习题
- 开始新一轮面试，清空当前输入、问题、回答和评价
- 最终评价成功后保存本地历史记录
- 展示本地历史保存成功或失败提示
- 展示最近本地历史记录列表
- 点击历史记录查看岗位摘要、简历摘要、整体评价和问答记录
- 开发环境下快速填入示例 JD/简历
- 开发环境下根据当前问题填入本地测试回答
- 开发环境下使用本地 Mock 问题快速进入答题流程
- 开发环境下使用本地 Mock 评价快速验证最终评价和历史记录链路

## 技术栈

当前使用：

- Next.js App Router
- React
- DeepSeek API
- Supabase Auth
- 普通 CSS

当前没有使用：

- 云端历史数据库
- 文件上传
- 云端历史记录
- 完整用户资料系统
- Tailwind CSS
- UI 组件库
- TypeScript

## 本地运行

如果依赖还没有安装，由项目所有者在项目根目录运行：

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

注意：按照项目协作规范，AI agent 不应擅自在用户电脑上安装依赖。如果需要新增依赖，应先说明原因和命令，由项目所有者自行安装。

## 环境变量

本地需要创建 `.env.local`：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
```

说明：

- `.env.local` 不应提交到 git。
- `DEEPSEEK_MODEL` 可选，不配置时服务端会使用默认模型。
- `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 用于 Supabase Auth 账号系统。
- `NEXT_PUBLIC_SUPABASE_URL` 必须是完整 `http/https` URL，不能只填 Supabase project ref。
- 不要把 Supabase `service_role` key 写进前端环境变量或提交到仓库。
- 修改 `.env.local` 后通常需要重启 `npm run dev`。

## 内部测试版准备

准备给少量同学或朋友测试前，优先阅读：

```text
docs/INTERNAL_TESTING_RELEASE.md
```

核心检查：

- 部署平台已配置 `DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`、`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`。
- Supabase Auth 的 Site URL 指向生产域名。
- Supabase Auth 的 Redirect URLs 包含生产域名通配，例如 `https://your-project.vercel.app/**`。
- 本地开发地址 `http://localhost:3000/**` 仍保留在 Redirect URLs 中。
- 不要在仓库提交 `.env.local`、真实 DeepSeek key、Supabase `service_role` key 或其他敏感配置。
- 内部测试用户需要知道：历史记录只保存在当前浏览器本地，不要输入特别敏感信息。

## 目录结构

```text
app/                              Next.js App Router 页面和 API route
app/page.js                       根路径入口，重定向到 /login
app/layout.js                     全局布局和 metadata
app/globals.css                   全局样式
app/login/page.js                 登录入口页面壳路由
app/interview/page.js             受保护的模拟面试主界面路由
app/api/generate-questions/       生成面试问题 API
app/api/evaluate-interview/       生成最终评价 API
proxy.js                          Supabase Auth cookie 刷新和 /interview 访问保护

components/LoginEntryShell.js     登录/注册入口页面壳
components/AuthStatusBar.js       当前账号展示和登出入口
components/InterviewSimulator.js  主前端组件

lib/client/interviewApi.js        前端请求封装
lib/client/interviewHistoryStorage.js 本地历史记录读写工具
lib/dev/interviewMocks.js         开发环境本地 mock 问题和 mock 评价
lib/supabase/browserClient.js     浏览器端 Supabase Auth client
lib/supabase/serverClient.js      服务端 Supabase Auth client
lib/server/deepseek.js            生成问题的 DeepSeek 服务端调用
lib/server/interviewEvaluation.js 最终评价的 DeepSeek 服务端调用
lib/server/parseAiQuestions.js    面试问题 JSON 解析和校验
lib/server/parseInterviewEvaluation.js 最终评价 JSON 解析和校验
lib/prompts/interviewQuestions.js 生成问题 prompt
lib/prompts/interviewEvaluation.js 最终评价 prompt

docs/PRD.md                       MVP 产品需求文档
docs/PROJECT_STATUS.md            当前项目状态文档
docs/ROADMAP.md                   阶段计划和优先级
docs/DEVELOPMENT_TESTING.md       开发测试说明
docs/INTERNAL_TESTING_RELEASE.md  内部测试版部署和 smoke test 清单
AGENTS.md                         AI agent 和开发协作规范
index.html                        旧版静态原型，仅供参考
```

## 数据流

生成问题：

```text
components/InterviewSimulator.js
  -> lib/client/interviewApi.js
  -> app/api/generate-questions/route.js
  -> lib/server/deepseek.js
  -> lib/prompts/interviewQuestions.js
  -> DeepSeek API
  -> lib/server/parseAiQuestions.js
  -> 前端展示问题列表
```

生成最终评价：

```text
components/InterviewSimulator.js
  -> lib/client/interviewApi.js
  -> app/api/evaluate-interview/route.js
  -> lib/server/interviewEvaluation.js
  -> lib/prompts/interviewEvaluation.js
  -> DeepSeek API
  -> lib/server/parseInterviewEvaluation.js
  -> 前端展示最终评价
```

前端不能直接调用 DeepSeek。API Key 只能在服务端读取。

## 开发测试

本地 `npm run dev` 时，页面会显示开发辅助按钮：

- `填入示例 JD/简历`
- `填入测试回答`
- `使用 Mock 问题`
- `使用 Mock 评价`

推荐测试路径：

1. 打开根路径后确认会进入 `/login`。
2. 使用新邮箱注册，或使用已注册邮箱登录。
3. 登录成功后进入 `/interview`。
4. 确认页面进入 `/interview`。
5. 点击浏览器返回键，确认能回到 `/login`。
6. 再次登录或直接访问 `/interview`，确认登录态仍可用。
7. 点击 `填入示例 JD/简历`。
8. 点击 `生成面试问题`。
9. 等待问题生成。
10. 点击 `填入测试回答`。
11. 点击 `提交全部回答`，或逐题点击 `提交本题回答`。
12. 确认进度为 `已提交 6 / 6`。
13. 点击 `生成最终评价`。
14. 检查最终评价是否完整展示。
15. 检查最终评价区是否提示已保存到本地历史记录。
16. 检查页面底部历史记录区是否新增记录，点击后是否能查看详情。
17. 点击 `开始新一轮`，确认当前输入、问题、回答和评价被清空，但历史记录仍保留。

如果真实 AI 请求失败，页面应显示对应错误提示：生成问题失败时可点击 `重试生成问题`，最终评价失败时可点击 `重试生成评价`。

开发环境也可以用 Mock 快速流程：填入示例 JD/简历后点击 `使用 Mock 问题`，填入并提交测试回答，再点击 `使用 Mock 评价` 验证最终评价和历史记录链路。

更多开发测试边界见：`docs/DEVELOPMENT_TESTING.md`。

## 本地项目位置

常用本地路径：

```text
/Users/a0000/personal-project/AI-Interview_Simulator
```

新的 session 开始任务前，应先用 `pwd` 和 `git rev-parse --show-toplevel` 确认当前目录。更详细的多 session 协作和轻量同步规则见 `AGENTS.md`。

## 重要文档阅读顺序

如果是新的开发者或 AI agent 接手，通用必读：

1. `README.md`
2. `AGENTS.md`
3. `docs/PROJECT_STATUS.md`
4. `docs/ROADMAP.md`

按需阅读：

- `docs/DEVELOPMENT_TESTING.md`：改开发辅助、mock 策略或本地测试流程时阅读。
- `docs/PRD.md`：改产品范围、用户流程、MVP 边界或非目标时阅读。

## Session 协作方式

当前项目推荐按阶段闭环拆分 session，而不是按前端/后端拆分。常用角色见 `AGENTS.md`：

- 产品助理 session
- 阶段开发 session
- 代码审查 session
- 开发测试 session（可选）

具体阶段计划和启动话术见 `docs/ROADMAP.md`。

## 当前不做的事情

当前 MVP 暂不做：

- 云端历史记录和完整用户资料系统
- 数据库存储
- 文件上传解析简历或 JD
- 云端/数据库历史面试记录
- OAuth、支付或权限系统
- 历史记录删除、编辑、搜索和恢复 session
- 多轮追问
- 语音或视频面试
- 单题即时 AI 批改
- 复杂 UI 重构

## 后续可能方向

具体阶段计划以 `docs/ROADMAP.md` 为准。可以小步考虑：

- 将开发辅助示例数据拆到单独 fixture 文件
