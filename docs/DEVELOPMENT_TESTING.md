# 开发测试说明

## 文档职责

这个文件记录 AI Interview Simulator 当前 MVP 的本地开发测试方式，帮助后续开发者或 AI agent 快速理解如何走完整流程、哪些按钮只是开发辅助，以及哪些边界不要随意改动。

关联文件：

- `components/InterviewSimulator.js`：开发辅助按钮和本地测试回答生成逻辑在这里。
- `app/globals.css`：开发辅助区和按钮样式在这里。
- `lib/client/interviewApi.js`：前端真实 API 请求封装在这里。
- `lib/client/interviewHistoryStorage.js`：最终评价成功后的本地历史记录读写工具在这里。
- `lib/dev/interviewMocks.js`：开发环境 Mock 问题和 Mock 评价数据在这里。
- `lib/supabase/browserClient.js`：浏览器端 Supabase Auth client。
- `lib/supabase/serverClient.js`：服务端 Supabase Auth client。
- `proxy.js`：Supabase Auth cookie 刷新和 `/interview` 访问保护。
- `app/api/generate-questions/route.js`：生成问题的后端 API。
- `app/api/evaluate-interview/route.js`：生成最终评价的后端 API。
- `docs/INTERNAL_TESTING_RELEASE.md`：内部测试版部署准备和生产 smoke test 清单。

## 当前开发辅助能力

页面在本地 `npm run dev` 时会显示开发辅助按钮，因为此时：

```js
process.env.NODE_ENV === 'development'
```

当前已有四个开发辅助按钮：

- `填入示例 JD/简历`：填入固定岗位信息和固定简历，并清空上一轮问题、回答、提交状态和评价。
- `填入测试回答`：在问题生成后显示，根据当前问题列表在前端本地生成 mock 回答。
- `使用 Mock 问题`：在开发环境下直接使用固定 mock 问题，不调用后端 API。
- `使用 Mock 评价`：在开发环境下根据当前已提交问答生成固定 mock 评价，不调用后端 API。

这些辅助按钮的目标是减少手动复制粘贴、等待 AI 返回和消耗 API 的成本，不是正式产品能力。

## 测试流程

推荐本地测试路径分两条。

真实 AI 流程：

1. 项目所有者运行 `npm run dev`。
2. 打开 `http://localhost:3000`。
3. 确认根路径显示基础主页，而不是直接进入 `/login`。
4. 确认主页展示登录入口、面试入口和未登录状态。
5. 未登录时点击主页的面试入口，确认进入 `/login`。
6. 使用新邮箱注册，或使用已注册邮箱登录。
7. 确认登录成功后浏览器地址进入 `/interview`。
8. 回到 `/`，确认主页显示当前账号信息，并且可以从主页进入 `/interview`。
9. 刷新 `/interview`，确认仍保持登录态。
10. 点击登出，确认回到 `/login`；再次登录后回到 `/interview`。
11. 点击 `填入示例 JD/简历`。
12. 点击真实 AI 问题按钮，等待 DeepSeek 返回问题列表。
13. 点击 `填入测试回答`。
14. 点击 `提交全部回答`，或逐题点击 `提交本题回答`。
15. 确认答题进度显示为 `已提交 6 / 6`。
16. 点击真实 AI 评价按钮，等待 DeepSeek 返回最终评价。
17. 检查页面是否展示总分、总结、优势、风险点、改进建议、逐题反馈和后续练习题。
18. 检查最终评价区是否显示 `最终评价已生成，并已保存到本地历史记录。`。
19. 检查页面底部历史记录区是否新增记录，点击后能看到详情。
20. 点击 `开始新一轮`，确认当前岗位 JD、简历、问题、回答、提交状态、评价和提示信息被清空，历史记录仍保留。

错误恢复检查：

- 真实 AI 生成问题失败时，应显示明确错误提示和 `重试生成问题`，点击后复用当前 JD 和简历再次请求。
- 真实 AI 最终评价失败时，应显示明确错误提示和 `重试生成评价`，点击后复用当前已提交问答再次请求。
- loading 期间不应允许重复点击生成或重试按钮。

Mock 快速流程：

1. 项目所有者运行 `npm run dev`。
2. 打开 `http://localhost:3000/login`。
3. 使用已注册邮箱登录。
4. 确认浏览器地址进入 `/interview`。
5. 点击 `填入示例 JD/简历`。
6. 点击 `使用 Mock 问题`，应立即展示固定问题列表。
7. 点击 `填入测试回答`。
8. 点击 `提交全部回答`，应立即显示 `已提交 6 / 6`。
9. 点击 `使用 Mock 评价`，应立即展示固定结构的最终评价。
10. 打开浏览器 DevTools，确认 localStorage 的 `ai-interview-sessions` 中新增一条完整记录，且 `generationSource` 标记为 mock。
11. 检查页面底部历史记录区是否新增记录，点击后能看到详情。
12. 点击 `开始新一轮`，确认页面回到初始输入状态，历史记录仍保留。

## 历史记录检查

当前阶段验证本地保存、历史列表和历史详情，不验证删除、编辑、搜索、云端同步或恢复 session。

生成最终评价后，localStorage 中的 `ai-interview-sessions` 应满足：

- 数据是数组，新记录排在最前面。
- 最多保留 10 条记录。
- 每条新记录包含 `id`、`version`、`source`、`generationSource`、`jobInfo`、`resume`、`questions`、`answers`、`questionAnswers`、`evaluation`、`createdAt` 和 `updatedAt`。
- `source` 当前为 `localStorage`。
- `generationSource.questions` 和 `generationSource.evaluation` 用于区分 `ai` 与 `mock`，旧历史记录没有该字段也应能正常展示。
- 如果 localStorage 写入失败，页面仍然展示最终评价，并显示本地保存失败提示。

页面底部历史记录区应满足：

- 没有历史记录时显示空状态。
- 有历史记录时显示最近记录数量、保存时间、岗位摘要、总分和可用的生成来源。
- 点击单条记录后，右侧或下方展示该记录的岗位摘要、简历摘要、整体评价和问答记录。
- 新完成一次最终评价后，历史列表自动刷新，并默认选中最新记录。

## 重要边界

后续 AI agent 修改时应遵守：

- 开发辅助按钮不应出现在生产环境。
- `填入测试回答` 不调用 DeepSeek，也不调用任何第三方 AI。
- `使用 Mock 问题` 和 `使用 Mock 评价` 只在开发环境显示，不调用后端 API，也不读取 API Key。
- 不要因为本地开发环境就自动切换另一套正式 prompt。真实 AI 按钮仍应走原来的后端 API 和正式 prompt。
- Mock 问题和 Mock 评价应由用户显式点击触发，不自动替代真实 AI。
- Mock 评价应复用现有本地历史保存机制，保证 mock 流程也能验证历史记录。
- 如果修改开发辅助逻辑，应按 `AGENTS.md` 的分档收尾规则判断是否更新本文件和 `docs/PROJECT_STATUS.md`。

## 阶段 8 检查点

开发模式 Mock 问题与 Mock 评价实现后，重点检查：

- 真实 AI 按钮和 mock 按钮是独立按钮，不互相替代。
- Mock 问题按钮复用岗位信息和简历的空输入校验。
- Mock 问题成功后会清空上一轮回答、提交状态、评价和保存提示。
- Mock 评价按钮只有在全部题目提交后才可用或才允许生成。
- Mock 评价展示结构和真实 AI 评价展示结构一致。
- Mock 评价成功后会新增本地历史记录，并且历史详情可查看。
- 如果保存 `generationSource`，真实 AI 流程写 `ai`，mock 流程写 `mock`，旧历史记录不受影响。

## 阶段 12 检查点

登录入口页面壳实现后，重点检查：

- 用户打开应用后先看到登录入口页面壳，而不是直接进入面试表单。
- 页面参考 `temp_pics/login_page_reference.png` 的“背景图 + 悬浮登录框”布局，但不要求像素级还原。
- 主按钮文案应类似 `进入体验版`，不要写成真实账号已经可用的语气。
- 如果有邮箱和密码输入，只做前端展示或轻量空输入提示，不保存、不上传、不打印密码。
- 点击入口按钮后能进入现有面试模拟器主界面。
- 进入主界面后，真实 AI 问题生成、回答提交、最终评价、Mock 问题、Mock 评价、本地历史记录和开始新一轮流程仍可用。
- 刷新页面后的行为应符合当前实现说明，不应假装存在服务端登录态。
- 生产环境不应出现开发 Mock 按钮，开发环境 Mock 按钮仍只在进入主界面后显示。

## 阶段 13 历史检查点

登录入口和面试主界面路由拆分后，阶段 13 当时重点检查：

说明：阶段 13 还没有真实账号系统，因此以下“不新增 session/token/cookie 逻辑”只适用于阶段 13 的历史验收语境。阶段 14 之后请以“阶段 14 检查点”和本文件前面的推荐测试流程为准。

- 访问 `/login` 能看到登录入口页面壳。
- 点击 `进入体验版` 后进入 `/interview`。
- 在 `/interview` 点击浏览器返回键，应回到 `/login`。
- 访问 `/` 时有明确行为，不应出现空白页或重复入口状态。
- `/interview` 中真实 AI 问题生成、回答提交、最终评价、Mock 问题、Mock 评价、本地历史记录和开始新一轮流程仍可用。
- 路由拆分不应变成真实鉴权：不新增登录 API，不保存密码，不新增 session/token/cookie 逻辑。
- 如果删除或简化 `components/AppEntry.js`，确认相关 file header 和文档描述已经同步。

## 阶段 14 检查点

Supabase Auth 账号系统 MVP 实现后，重点检查：

- `.env.local` 已配置 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`，且没有提交真实环境变量。
- 新邮箱可以注册。
- 已注册邮箱可以登录。
- 登录成功后进入 `/interview`。
- 未登录直接访问 `/interview` 时会回到 `/login`。
- 已登录时刷新 `/interview` 仍保持登录态。
- 登出后回到 `/login`，再次访问 `/interview` 会被拦回登录页。
- 登录/注册失败时有清楚错误提示，loading 期间不重复提交。
- 密码没有被写入 localStorage、历史记录、console log 或自定义数据结构。
- 代码中没有 Supabase `service_role` key。
- `/interview` 中真实 AI、Mock、本地历史记录、开始新一轮和错误重试流程仍可用。

## 阶段 15 检查点

内部测试版上线准备完成后，重点检查：

- 已阅读 `docs/INTERNAL_TESTING_RELEASE.md`。
- Vercel 或选定部署平台可以成功构建和部署。
- 部署环境已配置 `DEEPSEEK_API_KEY`、`DEEPSEEK_MODEL`、`NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`。
- Supabase Auth 的 Site URL 和 Redirect URLs 包含生产域名，并保留 `http://localhost:3000/**`。
- 生产环境新用户可以注册，已注册用户可以登录。
- 生产环境刷新 `/interview` 后仍保持登录态。
- 登出后回到 `/login`，未登录访问 `/interview` 会回到 `/login`。
- 登录后真实 AI 问题生成和最终评价可以正常调用。
- 生产环境不展示开发 Mock 按钮。
- 本地历史记录仍可保存和查看。
- README 或测试说明中包含“不要输入特别敏感信息”的内部测试提醒。
- 如果无法访问 Vercel 或 Supabase Dashboard，应至少完成本地 `npm run build`，并把未执行的外部平台 smoke test 明确记录给项目所有者。

生产 smoke test 的详细步骤见 `docs/INTERNAL_TESTING_RELEASE.md`。

## 阶段 16 检查点

基础主页框架实现后，重点检查：

- 访问 `/` 显示基础主页，而不是直接跳到 `/login`。
- 主页展示 `/login` 入口和 `/interview` 入口。
- 未登录状态下，主页显示未登录状态。
- 已登录状态下，主页显示当前账号信息，例如邮箱。
- 未登录时点击主页的 `/interview` 入口会直接进入 `/login`；未登录直接访问 `/interview` 也会回到 `/login`。
- 已登录时可以从主页进入 `/interview`。
- `/login` 注册/登录、`/interview` 面试主流程、登出和登录态保持仍可用。
- 生产环境不展示开发 Mock 按钮，开发环境 Mock 流程不受影响。

## 阶段 17 检查点

主页封面视觉优化完成后，重点检查：

- 主页是否保留顶栏。
- 主页首屏是否有大图 / hero cover 区域。
- Hero 区域是否保留 `/login` 和 `/interview` 两个真实入口。
- 是否显示登录状态；已登录时是否显示必要账号信息。
- 未登录点击主页 `/interview` 入口是否进入 `/login`。
- 已登录点击主页 `/interview` 入口是否进入 `/interview`。
- 页面视觉是否参考 `temp_pics/main_page_reference.png`，但没有做像素级硬还原。
- 是否没有新增假按钮、复杂 landing page 或不可用功能入口。
- 桌面和移动端是否不遮挡、不溢出、按钮可点击。
## 常见检查点

开发测试时重点确认：

- 岗位信息或简历为空时，点击生成问题会提示错误。
- 问题生成前不会显示问题列表。
- 问题生成后才显示 `填入测试回答`。
- 填入测试回答后，不会自动提交回答。
- 填入测试回答后，可以点击 `提交全部回答` 一次性提交所有非空回答。
- 修改某道题回答后，该题已提交状态会被清空。
- 所有题提交后，才能点击 `生成最终评价`。
- 填写全部回答并点击 `提交全部回答`，应一次性更新所有题目的提交状态。
- 如果仍有空回答，点击 `提交全部回答` 应提示先填写所有回答。
- 生成问题失败时会展示错误信息和 `重试生成问题`。
- 最终评价失败时会展示错误信息和 `重试生成评价`。
- 最终评价成功后，会自动尝试保存本地历史记录。
- 本地历史记录保存失败时，不应影响最终评价展示。
- 点击 `开始新一轮` 应清空当前岗位 JD、简历、问题、回答、提交状态、评价和提示信息。
- 点击 `开始新一轮` 不应删除本地历史记录。
- 当前页面有内容时，点击 `开始新一轮` 应先出现确认提示，避免误触。
- 空状态、错误提示、保存提示和关键按钮文案应清楚、不误导用户。
