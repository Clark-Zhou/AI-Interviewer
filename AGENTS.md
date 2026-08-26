# 项目协作规范

## 项目背景

这是一个 AI 模拟面试 MVP 项目。用户输入岗位信息和个人简历后，系统调用 AI 生成模拟面试问题；用户逐题回答并提交后，系统再调用 AI 生成最终面试评价。

当前技术方向：

- 前端：Next.js App Router
- AI 服务：DeepSeek API
- 当前阶段：已跑通“岗位信息 + 简历 -> 生成问题 -> 逐题回答 -> 最终评价”的 MVP 核心闭环，并已完成本地历史记录、Supabase Auth、主页优化、面试工作台拆分、本地文本导入和 PDF/DOCX 纯文本解析

## 新 session 接手规则

新的 AI agent 或新的对话 session 接手项目时，应先完成以下检查，再开始修改代码。

本地项目主目录：

```text
/Users/a0000/personal-project/AI-Interview_Simulator
```

如果当前终端目录不确定，先用 `pwd` 和 `git rev-parse --show-toplevel` 确认自己在项目根目录。

通用必读：

1. 阅读 `README.md`，了解项目目标、运行方式和目录结构。
2. 阅读 `AGENTS.md`，了解协作规则、边界和收尾要求。
3. 阅读 `docs/PROJECT_STATUS.md`，确认当前分支、已完成功能、未完成事项和下一步建议。
4. 阅读 `docs/ROADMAP.md`，确认当前计划、优先级、任务拆分和验收标准。

按需阅读：

- 如果要改开发测试辅助逻辑、mock 策略或本地测试流程，阅读 `docs/DEVELOPMENT_TESTING.md`。
- 如果要改产品范围、用户流程、MVP 边界或非目标，阅读 `docs/PRD.md`。
- 如果要追溯已完成历史阶段的详细方案，阅读 `docs/ROADMAP_ARCHIVE.md` 的相关章节。

PRD 降低优先级规则：

- `docs/PRD.md` 不是通用必读文件。普通开发、代码审查、样式调整、bug 修复和阶段内收尾不要默认读取 PRD。
- `docs/ROADMAP_ARCHIVE.md` 也不是通用必读文件。不要为了了解下一步任务而读取历史归档。
- 优先通过 `README.md`、`AGENTS.md`、`docs/PROJECT_STATUS.md` 和 `docs/ROADMAP.md` 理解当前任务。
- 只有当任务会改变产品目标、MVP 范围、用户主流程、非目标或长期边界时，才阅读或更新 PRD。
- 如果不确定是否需要读 PRD，先看 ROADMAP 中当前阶段是否明确要求；没有要求时不要为了保险而全文读取。

开始前检查：

1. 运行只读检查命令，例如 `git status --short` 和必要的 `rg` / `sed`，确认工作区是否已有用户改动。
2. 如果发现工作区有未提交改动，不要默认撤销；先判断是否与当前任务相关，必要时向用户确认。

接手时不要假设上下文仍然完整，应以仓库内文档和当前 git 状态为准。

## 新任务开始前的轻量同步规则

同一个 session 可能连续处理多个任务，中间可能穿插产品助理 session 的文档调整、代码审查 session 的反馈、用户的新要求或一次新的 commit。不要把上一个任务的理解当成当前任务的默认前提。

每次开始一个新任务前，先做轻量同步，不需要大量扫描：

```bash
git status --short
git log --oneline -3
```

根据当前情况判断本轮应该看哪里：

- 如果工作区有未提交改动，先看 `git diff`；如果用户说改动已放入 stage，也看 `git diff --staged`。
- 如果工作区干净，但用户说产品助理刚提交了计划，先看 `git show --stat HEAD`，必要时看 `git show HEAD -- docs/ROADMAP.md docs/PROJECT_STATUS.md`。
- 如果是代码审查任务，先判断审查对象是当前未提交 diff、staged diff、最近一次 commit，还是整个分支相对 main 的 diff。
- 如果同一个开发 session 连续做多个任务，每个新任务开始前都重新做这次轻量同步，不要沿用上一个任务的计划记忆。

同步后按任务需要阅读相关文档：通用优先看 `README.md`、`AGENTS.md`、`docs/PROJECT_STATUS.md`、`docs/ROADMAP.md`；涉及开发辅助、mock 或测试流程时，再看 `docs/DEVELOPMENT_TESTING.md`；只有涉及产品范围、用户主流程、MVP 边界或非目标变化时，才看 `docs/PRD.md`；只有需要追溯旧阶段详细决策时，才看 `docs/ROADMAP_ARCHIVE.md`。

如果开发或审查时发现文档之间存在模糊、矛盾、过时或互相反作用的地方，应停下来向用户说明问题并询问如何处理，不要自己猜一个解释继续开发。


## 多 session 协作规则

项目当前更适合按“阶段闭环”拆分 session，而不是按前端/后端拆分。一个阶段开发 session 应负责某个 ROADMAP 阶段的完整实现、必要文档同步和收尾检查。

推荐角色分工：

- 产品助理 session：维护产品范围、阶段计划、优先级和验收标准，主要修改 `docs/ROADMAP.md`、`docs/PROJECT_STATUS.md`；只有产品边界变化时才修改 `docs/PRD.md`。
- 阶段开发 session：按照 `docs/ROADMAP.md` 的某个阶段完成完整实现，可能同时修改前端、后端、prompt、客户端工具和相关文档。
- 代码审查 session：以 review 姿态检查阶段开发 session 的 diff、风险、遗漏测试和文档同步，不主动做大范围重构。
- 开发测试 session（可选）：维护本地测试流程和开发辅助边界，主要修改 `docs/DEVELOPMENT_TESTING.md`，必要时配合阶段开发 session 修改开发辅助按钮。

协作规则：

1. 每个 session 开始时说明自己的角色和本轮目标。
2. 阶段开发 session 应围绕一个 ROADMAP 阶段闭环，不要在同一轮顺手做多个阶段。
3. 不同 session 不应同时修改同一批文件；如果发现未提交改动，先确认归属。
4. 产品范围、优先级或验收标准变化时，先由产品助理 session 更新 `docs/ROADMAP.md` 或 `docs/PRD.md`，再进入开发。
5. 阶段开发 session 完成后，按“每次收尾工作”更新对应文档。
6. 代码审查 session 只基于当前 diff 和文档契约提问题、指出风险或做小修，不重新定义产品方向。
7. 如果任务边界不清晰，先写计划或提出问题，不要直接改代码。

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
- `填入测试回答`：根据当前问题，在前端本地拼出 mock 回答。
- 当前已包含 `使用 Mock 问题` 和 `使用 Mock 评价`，用于显式触发本地 mock 流程。

这些按钮只应依赖 `process.env.NODE_ENV === 'development'` 显示，不应出现在生产环境。

开发辅助逻辑的边界：

- 不要让开发环境自动切换另一套正式 prompt。
- 不要让测试回答按钮、Mock 问题按钮或 Mock 评价按钮调用 DeepSeek 或其他第三方 AI。
- 真实 AI 生成问题和真实 AI 最终评价仍应走原有后端 API。
- Mock 问题和 Mock 评价必须由开发者显式点击触发，不能自动替代真实 AI。
- Mock 评价应复用现有历史保存机制，确保 mock 面试也可以计入本地历史。
- 如果修改开发辅助逻辑，应按“每次收尾工作”的分档规则判断是否更新 `docs/DEVELOPMENT_TESTING.md` 和 `docs/PROJECT_STATUS.md`。

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

## 每次收尾工作

不要机械地每次修改所有优先文档。收尾按影响范围分三档处理。

### 小改动收尾

适用：局部文案、样式、小 bug、小范围代码整理，且不改变功能状态、API、数据结构或测试流程。

1. 运行 `git status --short`，确认本次改动范围是否符合预期。
2. 运行 `git diff --check`，检查空白、缩进和行尾问题。
3. 查看关键 diff，确认没有误改业务逻辑、密钥、依赖文件或无关文件。
4. 最终回复说明改了什么、验证了什么、哪些测试没有运行。

这类改动通常不需要更新 `README.md`、`docs/PROJECT_STATUS.md`、`docs/ROADMAP.md`、`docs/DEVELOPMENT_TESTING.md` 或 `docs/PRD.md`。

### 阶段内收尾

适用：ROADMAP 某阶段中的一部分实现，功能还没整体完成。

1. 完成“小改动收尾”。
2. 如果新增或修改重要代码文件，确认文件顶部有中文 file header。
3. 如果新增函数、较大逻辑块、关键条件判断或重要数据转换，确认有简短中文注释。
4. 只更新直接受影响的文档：
   - 数据结构、API 协议、验收标准或阶段拆分变化，更新 `docs/ROADMAP.md`。
   - 开发辅助按钮、mock 策略或本地测试流程变化，更新 `docs/DEVELOPMENT_TESTING.md`。
   - 用户可见功能状态或下一步建议明显变化，更新 `docs/PROJECT_STATUS.md`。
5. 不要因为“改过代码”就机械更新 `README.md` 或 `docs/PRD.md`。

### 阶段完成或 PR 前收尾

适用：ROADMAP 阶段完成、准备 PR、或用户要求整体收尾。

1. 完成“阶段内收尾”。
2. 更新 `docs/PROJECT_STATUS.md`，记录当前已完成状态、关键文件、已知限制和下一步建议。
3. 更新 `docs/ROADMAP.md`，勾选已完成阶段并调整当前优先级。
4. 如果安装、运行方式、目录结构、环境变量或总体功能说明变化，更新 `README.md`。
5. 如果开发测试路径变化，更新 `docs/DEVELOPMENT_TESTING.md`。
6. 只有产品目标、MVP 范围、用户流程或非目标变化时，才更新 `docs/PRD.md`。
7. 如果改动影响依赖，说明需要用户自行运行的安装命令，不要直接安装。
8. 如果没有实际运行测试，要在最终回复里说明“未运行测试”和原因。

收尾回复应简洁说明：改了什么、验证了什么、还有什么没有做。不要把命令输出原样大量贴给用户，只总结关键结果。

## 当前开发节奏

优先小步推进：

1. 先保持当前 MVP 核心闭环稳定。
2. 再小步优化开发测试效率和用户体验。
3. 后续如需新增 mock AI、历史记录增强、云端文件存储、OCR、图片识别或对话式提问，应先明确产品边界。
4. 账号系统只能在 ROADMAP 明确安排时开发；当前推荐使用 Supabase Auth。不要自建密码存储，不要使用或提交 Supabase `service_role` key，不要把密码写入 localStorage、日志或历史记录。云端历史记录、云端文件存储、OCR、图片识别、语音或视频面试仍需单独规划。

每一步都应保持可理解、可运行、可回退。
