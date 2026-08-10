# 项目当前状态

## 1. 项目目标

AI Interview Simulator 是一个个人项目，用于帮助求职者基于目标岗位信息和个人简历进行模拟面试准备。

当前 MVP 的核心目标是先跑通：

```text
岗位信息 + 个人简历 -> AI 生成面试问题 -> 页面结构化展示问题
```

完整 MVP 后续还会包含：用户回答问题、提交回答、AI 生成最终评价。

## 2. 当前阶段

当前分支：

```text
mvp-ai
```

当前已经完成的是 MVP 的第一段闭环：

```text
输入岗位信息
输入个人简历
点击生成面试问题
前端调用后端 API
后端调用 DeepSeek
后端解析 AI 返回 JSON
前端展示结构化问题列表
```

当前还没有实现用户回答和最终评价。

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

## 4. 重要文件

```text
AGENTS.md
```

项目协作规范。其他开发者或 AI agent 修改项目之前，应先阅读这个文件。

```text
docs/PRD.md
```

MVP 产品需求文档，描述产品目标、用户流程、功能范围和未来方向。

```text
docs/PROJECT_STATUS.md
```

当前项目状态文档，也就是本文件。用于快速了解项目已经做到哪里。

```text
app/page.js
```

Next.js 首页入口，只挂载主功能组件。

```text
components/InterviewSimulator.js
```

前端主组件，负责岗位信息和简历输入、按钮交互、loading、错误提示和问题列表展示。

```text
lib/client/interviewApi.js
```

前端请求封装。前端通过这里调用项目自己的后端 API。

```text
app/api/generate-questions/route.js
```

后端 API 入口，接收前端请求，做基础校验，然后调用服务端 AI 逻辑。

```text
lib/server/deepseek.js
```

DeepSeek 服务端调用封装。这里读取环境变量、调用 DeepSeek API，并把返回内容交给解析函数。

```text
lib/server/parseAiQuestions.js
```

AI 返回内容解析模块。负责把模型返回的 JSON 文本解析和校验成标准 `questions` 数组。

```text
lib/prompts/interviewQuestions.js
```

生成面试问题的 prompt 管理文件。后续优化问题质量时优先修改这里。

```text
app/globals.css
```

全局样式文件。当前使用普通 CSS，不依赖 Tailwind 或 UI 组件库。

## 5. 当前数据流

完整链路如下：

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

前端请求：

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
- DeepSeek chat completions 调用
- 面试问题 prompt
- AI 返回 JSON 解析
- 结构化问题列表展示
- 代码分层
- 中文 file header 和关键逻辑注释
- 项目协作规范 `AGENTS.md`

## 10. 未完成功能

尚未完成：

- 用户回答每个问题
- 保存每个问题的回答
- 提交回答生成最终评价
- 最终评价 prompt
- 最终评价 API route
- 最终评价页面展示
- AI 返回解析失败时的用户友好重试策略
- 文件上传解析简历或 JD
- 数据库存储历史记录
- 用户登录
- 部署配置

## 11. 下一步建议

建议下一步继续小步推进，不要一次做太大。

推荐下一步：

```text
在每个生成的问题下面增加回答输入框。
```

具体可以拆成：

1. 在 `components/InterviewSimulator.js` 中为每个问题展示一个 textarea。
2. 新增 `answers` 状态，保存每道题的回答。
3. 暂时不调用 AI 评价，只先把回答输入和状态保存跑通。
4. 确认交互稳定后，再设计最终评价 API。

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
- DeepSeek API Key 只能在服务端读取。
- 新建重要代码文件需要中文 file header。
- 函数和重要逻辑块需要简短中文注释。
- 依赖安装由项目所有者执行，AI agent 只提供命令和说明。
- 如果运行或测试多次失败，应先停下来讨论，不要持续枚举尝试。


**一个功能分支快结束、准备 PR 前，更新一次 PROJECT_STATUS.md**