# 项目协作规范

## 项目背景

这是一个 AI 模拟面试 MVP 项目。用户输入岗位信息和个人简历后，系统调用 AI 生成模拟面试问题；用户逐题回答并提交后，系统再调用 AI 生成最终面试评价。

当前技术方向：

- 前端：Next.js App Router
- AI 服务：DeepSeek API
- 当前阶段：已跑通“岗位信息 + 简历 -> 生成问题 -> 逐题回答 -> 最终评价”的 MVP 核心闭环

## 前后端职责边界

前端只能调用项目自己的后端 API，例如：

```text
/api/generate-questions
/api/evaluate-interview
```

前端不能直接调用 DeepSeek、OpenAI 或其他第三方 AI API。

原因：

- API Key 不能暴露在浏览器端。
- 第三方 AI 请求应统一放在服务端处理。
- Prompt、模型参数、错误处理应集中管理，避免散落在页面组件里。

推荐分层：

```text
components/                 前端页面和组件
lib/client/                 前端请求封装
app/api/                    Next.js 后端 API route
lib/server/                 服务端业务逻辑和第三方 API 调用
lib/prompts/                Prompt 模板和 AI 输出要求
```

## 开发辅助边界

当前页面包含仅在开发环境显示的辅助按钮：

- `填入示例 JD/简历`：填入固定测试输入，并清空上一轮问题、回答和评价。
- `填入测试回答`：根据当前 AI 生成的问题，在前端本地拼出 mock 回答。

这些按钮只应依赖 `process.env.NODE_ENV === 'development'` 显示，不应出现在生产环境。

开发辅助逻辑的边界：

- 不要让开发环境自动切换另一套正式 prompt。
- 不要让测试回答按钮调用 DeepSeek 或其他第三方 AI。
- 生成问题和最终评价仍应走真实后端 API，除非后续明确新增 mock AI 开关。
- 如果修改开发辅助逻辑，应同步更新 `docs/DEVELOPMENT_TESTING.md` 和 `docs/PROJECT_STATUS.md`。

## API Key 和环境变量

真实 API Key 只能放在本地 `.env.local` 中。

不要把以下文件提交到 git：

```text
.env.local
node_modules/
.next/
```

如果需要新增环境变量，应同步更新：

```text
.env.example
```

但 `.env.example` 只能写占位值，不能写真实 key。

## 依赖安装规则

AI agent 不应直接在用户电脑上安装依赖。

如果需要安装依赖，应该先告诉用户：

- 为什么需要安装
- 应该在哪个目录运行
- 应该运行什么命令
- 成功后应该看到什么结果

然后由用户自己执行安装命令。

例如：

```bash
cd /Users/a0000/personal-project/AI-Interview_Simulator
npm install
```

不应擅自执行：

```bash
npm install
pip install
brew install
npx create-...
```

## 运行和测试规则

AI agent 可以建议用户运行项目，例如：

```bash
npm run dev
```

但如果需要在本机启动服务、安装依赖、下载包或修改本机环境，应先说明并让用户确认。

如果自行运行或测试代码时出现以下情况：

- 同一个问题连续失败多次
- 命令长时间卡住
- 依赖安装或网络请求没有明显进展
- 需要尝试多种修复路线
- 可能产生大量文件或大量 git changes

AI agent 应该先停下来，向用户说明当前情况和可选方案，而不是持续枚举各种方法反复尝试。

## 文件注释规则

所有新建的重要代码文件，都应在文件顶部添加中文 file header，说明：

- 文件职责
- 关联文件
- 注意事项

已有重要代码文件也应尽量补齐 file header，方便后续维护。

函数、较大的逻辑块、重要条件判断或关键数据转换，应有简单中文注释，说明它的作用和为什么需要这段逻辑。

注释应简洁，避免解释过于显而易见的语句。优先解释“目的”和“边界”，而不是逐行翻译代码。

## 当前开发节奏

优先小步推进：

1. 先保持当前 MVP 核心闭环稳定。
2. 再小步优化开发测试效率和用户体验。
3. 后续如需新增 mock AI、历史记录或文件上传，应先明确产品边界。
4. 暂不做登录、数据库、文件上传、语音或视频面试。

每一步都应保持可理解、可运行、可回退。
