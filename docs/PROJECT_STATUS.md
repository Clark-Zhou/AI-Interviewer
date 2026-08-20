# 项目当前状态

## 1. 项目目标

AI Interview Simulator 是一个个人项目，用于帮助求职者基于目标岗位信息和个人简历进行模拟面试准备。

当前 MVP 的核心目标是先跑通：

```text
岗位信息 + 个人简历 -> AI 生成面试问题 -> 用户逐题回答 -> AI 生成最终评价
```

这个阶段暂时不做登录、数据库、文件上传和云端历史记录，先验证最核心的面试练习闭环是否成立。目前已经完成本地历史记录初始化、列表和详情查看，用于保存并复盘完整面试 session。

## 2. 当前阶段

当前分支：

```text
develop-improve-efficiency
```

当前已经完成的是 MVP 的核心闭环和开发效率优化：

```text
输入岗位信息
输入个人简历
点击生成面试问题
前端调用后端生成问题 API
后端调用 DeepSeek
后端解析 AI 返回 JSON
前端展示结构化问题列表
用户逐题输入回答
用户逐题提交回答
用户一键提交全部回答
页面展示答题进度
开发环境可快速填入示例 JD/简历
开发环境可根据当前问题填入本地测试回答
所有回答提交后生成最终评价
前端调用后端最终评价 API
后端调用 DeepSeek
后端解析最终评价 JSON
前端展示整体评价和逐题反馈
最终评价成功后保存完整本地历史记录
页面展示本地保存成功或失败提示
页面底部展示最近本地历史记录列表
点击历史记录后展示岗位摘要、简历摘要、整体评价和问答记录

开发环境独立 Mock 问题按钮
开发环境独立 Mock 评价按钮
Mock 评价复用本地历史保存机制
本地历史记录保存 AI / Mock 来源标记
```

## 3. 技术栈

当前技术选择：

```text
Next.js App Router
React
DeepSeek API
普通 CSS
```

当前没有使用：

```text
数据库
用户系统
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
app/page.js
```

Next.js 首页入口，只挂载主功能组件。

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
```

注意：

- `.env.local` 不应提交到 git。
- `.env.example` 只能放占位值，不能放真实 key。
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
- 岗位信息输入框
- 个人简历输入框
- 前端空输入校验
- DeepSeek API Key 环境变量读取
- `/api/generate-questions` 后端 API
- 生成问题 DeepSeek chat completions 调用
- 面试问题 prompt
- AI 问题返回 JSON 解析
- 结构化问题列表展示
- 每道题单独回答输入框
- 每道题单独提交按钮
- 一键提交全部回答
- 答题进度展示
- 开发环境填入示例 JD/简历
- 开发环境根据当前问题填入本地测试回答
- `/api/evaluate-interview` 后端 API
- 最终评价 DeepSeek chat completions 调用
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
- 代码分层
- 中文 file header 和关键逻辑注释
- 项目协作规范 `AGENTS.md`

## 10. 暂未完成 / 暂不做

当前 MVP 还没有做：

- AI 返回解析失败时的用户友好重试按钮
- 文件上传解析简历或 JD
- 恢复历史 session 到当前页面
- 历史记录删除、编辑和搜索
- 数据库或云端同步历史记录
- 用户登录
- 部署配置
- 多轮追问
- 语音或视频面试
- 单题即时 AI 批改

这些功能不影响当前 MVP 主流程验证，可以在后续分支逐步做。

## 11. 下一步建议

建议下一步继续小步推进，不要一次做太大。

推荐下一步：

```text
先做一次人工回归测试并准备当前分支的 Pull Request；下一步可优先评估最终评价失败后的重试能力。
```

建议检查：

1. 岗位信息为空时，点击生成问题是否提示错误。
2. 简历为空时，点击生成问题是否提示错误。
3. 正常输入岗位和简历后，是否可以生成问题。
4. 每道题未填写回答时，点击提交是否提示错误。
5. 每道题填写并提交后，答题进度是否正确更新。
6. 所有题提交后，是否可以生成最终评价。
7. 修改某道题回答后，旧的提交状态和旧评价是否被清空。
8. 最终评价成功后，页面是否提示已保存到本地历史记录。
9. localStorage 的 `ai-interview-sessions` 中是否新增完整 session，并且最新记录排在最前面。
10. 多次完成评价后，本地历史是否最多保留 10 条。
11. 页面底部历史记录区是否显示最新记录。
12. 点击历史记录后，是否能看到岗位摘要、简历摘要、整体评价和问答记录。
13. 开发环境下 `使用 Mock 问题` 是否不调用后端 API，并能进入答题流程。
14. 开发环境下 `使用 Mock 评价` 是否不调用后端 API，并能生成最终评价。
15. Mock 评价成功后是否新增本地历史记录，并显示 Mock 来源标记。
16. 填写全部回答并点击 `提交全部回答`，是否一次性更新所有题目的提交状态。
17. 如果仍有空回答，点击 `提交全部回答` 是否提示先填写所有回答。

后续可以优先考虑：

- 为最终评价失败增加重试按钮。
- 优化最终评价 prompt 的评分标准。
- 补充更正式的 PR 描述和测试记录。

不建议马上做：

- 登录注册
- 数据库
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
