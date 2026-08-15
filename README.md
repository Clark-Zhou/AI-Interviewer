# AI Interview Simulator

> 文档职责：这是项目的入口说明文档，帮助第一次打开仓库的人快速了解项目目标、当前功能、运行方式、目录结构和开发测试流程。

AI Interview Simulator 是一个个人 MVP 项目，用于帮助求职者基于目标岗位信息和个人简历进行模拟面试准备。

当前核心流程：

```text
岗位信息 + 个人简历 -> AI 生成面试问题 -> 用户逐题回答 -> AI 生成最终评价
```

当前版本先验证最小可用闭环，不包含登录、数据库、文件上传、云端历史记录、语音或视频面试。当前已完成本地历史记录初始化、列表和详情查看，用于在浏览器保存并复盘完整面试 session。

## 当前功能

已经完成：

- 输入岗位 JD
- 输入个人简历
- 前端空输入校验
- 调用后端 API 生成 6 道结构化面试问题
- 展示问题分类、问题文本和提问原因
- 每道题单独填写回答
- 每道题单独提交回答
- 展示答题进度
- 所有回答提交后生成最终评价
- 展示总分、总结、优势、风险点、改进建议、逐题反馈和后续练习题
- 最终评价成功后保存本地历史记录
- 展示本地历史保存成功或失败提示
- 展示最近本地历史记录列表
- 点击历史记录查看岗位摘要、简历摘要、整体评价和问答记录
- 开发环境下快速填入示例 JD/简历
- 开发环境下根据当前问题填入本地测试回答

## 技术栈

当前使用：

- Next.js App Router
- React
- DeepSeek API
- 普通 CSS

当前没有使用：

- 数据库
- 用户系统
- 文件上传
- 云端历史记录
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
```

说明：

- `.env.local` 不应提交到 git。
- `DEEPSEEK_MODEL` 可选，不配置时服务端会使用默认模型。
- 修改 `.env.local` 后通常需要重启 `npm run dev`。

## 目录结构

```text
app/                              Next.js App Router 页面和 API route
app/page.js                       首页入口
app/layout.js                     全局布局和 metadata
app/globals.css                   全局样式
app/api/generate-questions/       生成面试问题 API
app/api/evaluate-interview/       生成最终评价 API

components/InterviewSimulator.js  主前端组件

lib/client/interviewApi.js        前端请求封装
lib/client/interviewHistoryStorage.js 本地历史记录读写工具
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

推荐测试路径：

1. 点击 `填入示例 JD/简历`。
2. 点击 `生成面试问题`。
3. 等待问题生成。
4. 点击 `填入测试回答`。
5. 逐题点击 `提交本题回答`。
6. 确认进度为 `已提交 6 / 6`。
7. 点击 `生成最终评价`。
8. 检查最终评价是否完整展示。
9. 检查最终评价区是否提示已保存到本地历史记录。
10. 检查页面底部历史记录区是否新增记录，点击后是否能查看详情。

更多开发测试边界见：`docs/DEVELOPMENT_TESTING.md`。

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

- 登录注册
- 数据库存储
- 文件上传解析简历或 JD
- 云端/数据库历史面试记录
- 历史记录删除、编辑、搜索和恢复 session
- 多轮追问
- 语音或视频面试
- 单题即时 AI 批改
- 复杂 UI 重构

## 后续可能方向

具体阶段计划以 `docs/ROADMAP.md` 为准。可以小步考虑：

- 为最终评价失败增加重试按钮
- 将开发辅助示例数据拆到单独 fixture 文件
- 增加显式 mock AI 开关，降低开发测试成本
- 评估是否支持恢复历史 session
