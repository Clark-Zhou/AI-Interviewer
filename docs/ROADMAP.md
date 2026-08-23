# Roadmap

## 文档职责

这个文件记录 AI Interview Simulator 的阶段计划、当前优先级、验收标准、暂缓事项和决策原因。它用于帮助产品助理、阶段开发、代码审查、开发测试等不同 session 对齐“接下来按什么顺序做”。

关联文件：

- `README.md`：项目入口说明，告诉新读者项目是什么、怎么运行。
- `AGENTS.md`：多 session 和 AI agent 协作规则。
- `docs/PROJECT_STATUS.md`：当前事实，记录已经完成什么、当前阶段是什么。
- `docs/PRD.md`：产品范围和需求定义，产品助理 session 或产品范围变化时阅读。
- `docs/DEVELOPMENT_TESTING.md`：开发测试流程和开发辅助边界。

## 当前推荐方向

当前 MVP 已经跑通“岗位信息 + 简历 -> 生成问题 -> 用户回答 -> AI 生成最终评价”，并已完成基础主页框架、主页封面视觉优化、本地历史记录、开发模式 Mock 流程、一键提交全部回答、开始新一轮面试、AI 请求失败后的基础重试入口、登录入口页面壳、`/login` 和 `/interview` 前端路由拆分、Supabase Auth 账号系统 MVP，以及内部测试版上线准备文档。下一步建议按 `docs/INTERNAL_TESTING_RELEASE.md` 完成外部平台部署和生产 smoke test，或先进行阶段 17 代码审查。

原因：

- 阶段 17 已完成，根路径 `/` 已经有顶栏、青色系 hero cover、登录入口、面试入口和登录状态。
- 在内测或部署前，建议继续做代码审查和生产环境 smoke test。
- 参考图提供了顶栏、大图和按钮位置的方向，但当前实现没有做复杂 landing page。
- 当前只有 `/login`、`/interview` 和登录状态是真实入口，其他未来按钮先不做。

## 阶段计划

- [x] 阶段 1：生成面试问题闭环
- [x] 阶段 2：用户逐题回答和提交
- [x] 阶段 3：最终评价 API 和页面展示
- [x] 阶段 4：开发辅助按钮，降低本地测试成本
- [x] 阶段 5：准备并合并当前用户回答/最终评价分支 PR
- [x] 阶段 6：历史记录初始化
- [x] 阶段 7：历史记录列表和详情查看
- [x] 阶段 8：开发模式 Mock 问题与 Mock 评价
- [x] 阶段 9：一键提交全部回答
- [x] 阶段 10：开始新一轮面试
- [x] 阶段 11：错误恢复与文案小修
- [x] 阶段 12：登录入口页面壳
- [x] 阶段 13：登录入口和面试主界面路由拆分
- [x] 阶段 14：Supabase Auth 账号系统 MVP
- [x] 阶段 15：内部测试版上线准备
- [x] 阶段 16：基础主页框架
- [x] 阶段 17：主页封面视觉优化

## 当前优先级

当前优先级：

1. 对阶段 17 进行代码审查，重点看主页首屏、入口行为和响应式表现。
2. 按 `docs/INTERNAL_TESTING_RELEASE.md` 完成外部平台部署和生产 smoke test。
3. 继续保留当前真实入口：`/login`、`/interview` 和登录状态显示。
4. 不新增未来功能按钮、复杂 landing page 或大范围业务改动。
5. 确认 `/login`、`/interview`、认证状态和面试主流程不受影响。

推荐当前功能分支：

```text
develop-private-test-version
```

## 阶段 6：历史记录初始化

阶段状态：已完成。当前实现已经新增 `lib/client/interviewHistoryStorage.js`，并在最终评价成功后自动把完整 session 保存到 localStorage。

### 阶段目标

让用户在完成一次模拟面试并生成最终评价后，浏览器能保存这次完整面试记录。这个阶段的目标是沉淀数据结构和保存机制，不追求完整历史管理系统。

### 用户价值

用户完成一次练习后，可以保留结果，后续用于复盘、对比不同岗位或继续优化回答。

开发价值：

- 为后续历史记录列表、详情页、恢复 session 和数据库持久化打基础。
- 让完整面试 session 的结构先稳定下来。
- 之后如果做 AI 逐步提问，也能复用同一套 session 概念。

### MVP 范围

本阶段建议包含：

- 定义本地 interview session 数据结构。
- 新增 localStorage 读写工具。
- 最终评价生成成功后保存完整 session。
- 保存失败时不影响用户看到最终评价。
- 页面给出轻量保存状态提示。
- 开发测试文档补充历史记录测试路径。

本阶段暂不包含：

- 数据库。
- 真实用户登录。
- 云端同步。
- 删除历史记录。
- 编辑历史记录。
- 恢复历史 session 到当前页面。
- 复杂历史详情 UI。

### 建议数据结构

一次完整面试 session 建议先保存为：

```js
{
  id: 'local-session-id',
  version: 1,
  source: 'localStorage',
  jobInfo: '岗位信息文本',
  resume: '简历文本',
  questions: [
    {
      category: '岗位匹配',
      question: '问题文本',
      reason: '为什么问这个问题'
    }
  ],
  answers: {
    0: '用户第 1 题回答'
  },
  questionAnswers: [
    {
      category: '岗位匹配',
      question: '问题文本',
      reason: '为什么问这个问题',
      answer: '用户第 1 题回答'
    }
  ],
  evaluation: {
    overallScore: 80,
    summary: '整体评价文本',
    strengths: [],
    risks: [],
    improvementSuggestions: [],
    questionFeedback: [],
    nextPracticeQuestions: []
  },
  createdAt: 'ISO 时间',
  updatedAt: 'ISO 时间'
}
```

字段说明：

- `id`：本地唯一 id，可以用时间戳加随机字符串生成。
- `version`：本地数据结构版本，方便后续迁移。
- `source`：当前先写 `localStorage`，未来接数据库时可区分来源。
- `answers`：保留前端当前按题号存回答的结构，方便恢复。
- `questionAnswers`：保留最终评价 API 使用的标准数组，方便详情展示和未来复评。
- `evaluation`：保存 AI 返回的标准最终评价对象。
- `createdAt` / `updatedAt`：用于列表排序和展示时间。

### localStorage 策略

建议 key：

```text
ai-interview-sessions
```

保存策略：

- 使用数组保存多条 session。
- 新记录放在数组最前面。
- 第一版最多保留 10 条，避免 localStorage 无限增长。
- 如果 localStorage 不可用或写入失败，只显示轻量错误，不影响最终评价展示。

建议工具文件：

```text
lib/client/interviewHistoryStorage.js
```

建议方法：

```js
saveInterviewSession(session)
getInterviewSessions()
createInterviewSessionId()
```

### 页面交互建议

第一步可以很轻：

- 最终评价成功后自动保存。
- 评价区附近显示：`已保存到本地历史记录`。
- 保存失败时显示：`最终评价已生成，但本地保存失败`。

已完成：

- 页面下方展示最近历史记录列表。
- 每条显示保存时间、岗位信息摘要、总分。
- 点击后展开或展示详情。

当前仍暂不做：

- 删除历史记录。
- 编辑历史记录。
- 搜索历史记录。
- 恢复历史 session 到当前页面。
- 云端同步。

### 任务拆分

建议阶段开发 session 按以下顺序实现：

1. 新建 `lib/client/interviewHistoryStorage.js`，封装 localStorage 读写。
2. 在工具文件中实现 id 生成、读取历史、保存历史、最多保留 10 条。
3. 在 `components/InterviewSimulator.js` 中，最终评价成功后组装 session 对象。
4. 保存 session 到 localStorage，并增加保存成功/失败状态。
5. 在最终评价区显示轻量保存状态。
6. 更新 `docs/DEVELOPMENT_TESTING.md`，补充保存历史记录的测试路径。
7. 更新 `docs/PROJECT_STATUS.md`，记录历史记录初始化状态。

### 验收标准

阶段 6 完成时，应满足：

- 生成最终评价成功后，localStorage 中新增一条完整 session。
- session 中包含 jobInfo、resume、questions、answers、questionAnswers、evaluation、createdAt、updatedAt。
- 多次完成评价后，历史数组按最新在前排序。
- 最多保留 10 条本地历史。
- localStorage 写入失败不影响最终评价展示。
- 页面能提示保存成功或保存失败。
- 新增工具文件有中文 file header。
- 新增函数和关键逻辑有简短中文注释。
- 开发测试说明和项目状态文档已同步更新。

### 代码审查关注点

代码审查 session 应重点检查：

- 是否把 localStorage 逻辑封装在 `lib/client/`，没有散落在组件各处。
- 是否避免服务端文件 import 浏览器专用 localStorage 工具。
- 是否没有把历史记录保存逻辑放进 API route。
- 是否正确处理 JSON parse 失败、localStorage 不可用、写入超限等情况。
- 是否没有引入新依赖。
- 是否没有改变现有生成问题和最终评价 API 协议。

## 阶段 7：历史记录列表和详情查看

阶段状态：已完成。当前页面底部已经展示最近本地历史记录，点击单条记录可以查看岗位摘要、简历摘要、整体评价和问答记录。

### 验收标准

- 没有历史记录时显示空状态。
- 有历史记录时显示最近记录数量、保存时间、岗位摘要和总分。
- 点击单条记录后展示该记录详情。
- 新完成一次最终评价后，历史列表自动刷新，并默认选中最新记录。
- 不引入删除、编辑、搜索、恢复 session、数据库或云端同步。

## 阶段 8：开发模式 Mock 问题与 Mock 评价

阶段状态：已完成。当前分支为 `develop-improve-efficiency`。

### 阶段目标

在开发模式下，让开发者既可以继续使用真实 AI 生成问题和最终评价，也可以一键使用本地 mock 问题和 mock 评价快速跑完整流程。两条路径按钮独立，mock 不调用 DeepSeek，不新增依赖，但 mock 结果要进入和真实 AI 相同的页面状态、评价展示和本地历史记录保存链路。

### 用户价值

这个能力不面向正式用户，主要服务开发测试：减少重复粘贴、等待 AI 返回和消耗 API 的成本，让开发者能更快验证“问题 -> 回答 -> 评价 -> 历史记录”的完整闭环。

### MVP 范围

本阶段应包含：

- 新增独立 mock 数据文件，建议为 `lib/dev/interviewMocks.js`。
- 在开发环境的问题生成区域保留真实 AI 按钮，并新增 `使用 Mock 问题` 按钮。
- 在开发环境的最终评价区域保留真实 AI 按钮，并新增 `使用 Mock 评价` 按钮。
- Mock 问题使用固定结构化问题数组，不调用后端 API。
- Mock 评价根据当前 `questionAnswers` 返回固定结构的评价对象，不调用后端 API。
- Mock 评价生成后复用现有历史保存逻辑，历史记录里能看到这次 mock 面试。
- 建议在保存的 session 中增加轻量来源标记，例如 `generationSource.questions` 和 `generationSource.evaluation`，用于区分 `ai` 与 `mock`。
- 更新开发测试说明，补充真实 AI 流程和 mock 流程的测试路径。

本阶段暂不包含：

- 新增后端 mock API route。
- 新增环境变量控制 mock。
- 生产环境展示 mock 按钮。
- 自动用 mock 替代真实 AI。
- 数据库或云端历史记录。
- 恢复历史 session 到当前页面。
- AI 逐步提问、多轮追问或单题即时批改。

### 建议任务拆分

阶段开发 session 按以下顺序实现，不要一次扩展到其他功能：

1. 新建 `lib/dev/interviewMocks.js`，添加中文 file header。
2. 在 mock 文件中导出固定 `mockInterviewQuestions`，结构必须和真实问题 API 返回的 question item 一致。
3. 在 mock 文件中导出 `createMockInterviewEvaluation(questionAnswers)`，返回结构必须和真实最终评价 API 返回的 `evaluation` 一致。
4. 在 `components/InterviewSimulator.js` 中新增开发环境 `使用 Mock 问题` 按钮，和真实 `AI 生成问题` 按钮独立。
5. Mock 问题按钮应复用当前空输入校验；成功后清空上一轮回答、提交状态、评价和保存提示。
6. 在最终评价区域新增开发环境 `使用 Mock 评价` 按钮，和真实 `AI 生成最终评价` 按钮独立。
7. Mock 评价按钮应复用当前“所有题已提交后才能评价”的约束。
8. 抽出或复用一段统一逻辑处理“设置 evaluation + 保存历史 + 刷新历史列表”，避免 AI 评价和 Mock 评价各写一套保存代码。
9. 如新增 `generationSource`，真实 AI 路径写 `ai`，mock 路径写 `mock`，不要破坏旧历史记录读取。
10. 更新 `docs/DEVELOPMENT_TESTING.md`，说明开发模式下真实 AI 和 mock 两条完整测试流程。
11. 阶段完成或准备 PR 前，按 `AGENTS.md` 的分档收尾规则更新 `docs/PROJECT_STATUS.md` 和 `docs/ROADMAP.md`。

### 验收标准

阶段 8 完成时，应满足：

- 生产环境不显示 mock 问题或 mock 评价按钮。
- 开发环境同时存在真实 AI 按钮和 mock 按钮，且按钮语义清楚。
- 点击真实 AI 生成问题仍调用 `/api/generate-questions`。
- 点击真实 AI 生成最终评价仍调用 `/api/evaluate-interview`。
- 点击 `使用 Mock 问题` 不调用后端 API，也不读取 API Key。
- 点击 `使用 Mock 评价` 不调用后端 API，也不读取 API Key。
- Mock 问题后可以继续填写回答、逐题提交并显示进度。
- Mock 评价后页面展示完整评价结构。
- Mock 评价后 localStorage 的 `ai-interview-sessions` 新增记录，历史列表和详情可查看。
- 如果保存 session 增加来源标记，旧历史记录仍能正常展示。
- 新增文件有中文 file header，新增函数和关键逻辑有简短中文注释。
- 没有新增依赖，没有改变正式 AI prompt。

### 代码审查关注点

代码审查 session 应重点检查：

- Mock 逻辑是否只在开发环境入口可触发。
- Mock 数据是否放在 `lib/dev/`，没有混入 `lib/server/` 或 prompt 文件。
- 前端是否仍然不能直接调用 DeepSeek 或其他第三方 AI。
- AI 路径和 Mock 路径是否共享状态更新和历史保存机制，避免重复逻辑分叉。
- Mock 返回结构是否和真实 API 解析后的结构一致。
- 历史记录是否能区分来源，同时兼容旧数据。
- 是否没有引入新依赖、没有启动或要求用户安装额外工具。

## 阶段 9：一键提交全部回答

阶段状态：已完成。当前分支为 `develop-improve-efficiency`。

### 阶段目标

在问题列表出现后，为用户提供一个 `提交全部回答` 按钮。用户填写完所有回答后，可以一次性把所有题标记为已提交，从而减少真实使用和开发测试中的重复点击。

### 用户价值

用户仍然可以逐题思考和单独提交，但在已经填完所有回答时，不需要重复点击 6 次提交按钮。开发测试时也可以先用 `填入测试回答`，再一键提交全部回答，更快进入最终评价环节。

### MVP 范围

本阶段应包含：

- 在问题列表区域新增 `提交全部回答` 按钮。
- 如果没有问题列表，不显示该按钮。
- 如果存在空回答，点击后提示用户先填写完整。
- 如果所有回答都有内容，点击后一次性把所有题标记为已提交。
- 如果部分题已经单独提交过，一键提交后应保证所有非空题都处于已提交状态。
- 提交成功后答题进度更新为 `已提交 6 / 6`，最终评价按钮可以继续按现有规则出现或启用。
- 如果用户之后修改某一道回答，沿用现有逻辑：该题提交状态清空，旧评价清空。
- 更新开发测试说明，补充一键提交全部回答的检查点。

本阶段暂不包含：

- 自动生成回答。
- 自动提交空回答。
- 调用 AI、后端 API 或 mock 评价。
- 自动生成最终评价。
- 保存历史记录。
- 改动单题提交逻辑的核心语义。
- 改动 AI prompt、API 协议或本地历史数据结构。

### 建议任务拆分

阶段开发 session 按以下顺序实现，不要扩展到其他功能：

1. 先阅读 `components/InterviewSimulator.js` 中当前回答、提交状态、评价清空和答题进度的状态逻辑。
2. 新增一个处理函数，例如 `handleSubmitAllAnswers`，并添加简短中文注释说明作用。
3. 在处理函数中复用现有回答非空判断；如果有空回答，设置现有错误提示，不改变提交状态。
4. 如果全部回答非空，将所有题号标记为已提交，并清空错误提示。
5. 在问题列表区域加入 `提交全部回答` 按钮，保留每道题自己的 `提交本题回答` 按钮。
6. 确认修改单题回答后，已有的单题提交状态清空逻辑仍然生效。
7. 如需样式，仅在 `app/globals.css` 做小范围补充，避免 UI 大改。
8. 更新 `docs/DEVELOPMENT_TESTING.md` 中的一键提交测试路径或检查点。
9. 阶段完成或准备 PR 前，按 `AGENTS.md` 的分档收尾规则更新 `docs/PROJECT_STATUS.md` 和 `docs/ROADMAP.md`。

### 验收标准

阶段 9 完成时，应满足：

- 问题列表生成后能看到 `提交全部回答` 按钮。
- 没有问题列表时不显示 `提交全部回答` 按钮。
- 存在任意空回答时，点击 `提交全部回答` 会提示先填写所有回答。
- 所有回答都有内容时，点击后全部题目标记为已提交。
- 答题进度正确更新为已提交题数。
- 每道题单独提交按钮仍然可用。
- 修改某道已提交回答后，该题提交状态会清空，旧评价也会清空。
- 一键提交不调用后端 API、不调用 DeepSeek、不调用 mock 评价。
- 最终评价生成和历史保存仍由原有评价按钮触发。
- 新增函数或关键逻辑有简短中文注释。
- 没有新增依赖。

### 代码审查关注点

代码审查 session 应重点检查：

- 是否只新增提交状态相关逻辑，没有顺手改 AI、prompt、mock 或历史保存。
- 空回答校验是否覆盖所有题目，并且不会把空回答标记为已提交。
- 一键提交和单题提交是否共存，不互相破坏。
- 修改回答后清空提交状态和旧评价的现有行为是否仍然存在。
- UI 文案是否清楚，按钮不会和 `生成最终评价` 混淆。
- 是否没有引入新依赖或启动服务。

## 阶段 10：开始新一轮面试

阶段状态：已完成。当前分支为 `develop-improve-efficiency`。

### 阶段目标

提供一个明确的重置入口，让用户在完成或中断一轮模拟面试后，可以快速清空当前页面的岗位 JD、简历、问题、回答、提交状态、最终评价和提示信息，回到可以开始新一轮面试的初始状态。

### 用户价值

用户和开发者可以更快开始下一轮测试，不需要手动删除多个输入框和结果区域。对于开发流程，配合 Mock 问题、Mock 评价和一键提交全部回答，可以更快重复验证完整闭环。

### MVP 范围

本阶段应包含：

- 新增一个清晰的按钮，建议文案为 `开始新一轮` 或 `清空当前面试`。
- 按钮可放在页面顶部操作区或输入区附近，位置应容易找到，但不要和生成问题、生成评价混淆。
- 点击后清空当前岗位 JD、简历、问题列表、回答内容、提交状态、最终评价、错误提示、loading 状态和本地保存提示。
- 清空后页面应回到问题列表未展示的初始状态。
- 清空后用户可以重新输入 JD/简历，也可以在开发环境继续点击 `填入示例 JD/简历`。
- 如果当前页面已有输入、问题、回答或评价，点击清空前建议给一次浏览器确认，降低误触成本。
- 清空当前面试不删除本地历史记录，不清空 `localStorage` 的 `ai-interview-sessions`。
- 更新开发测试说明，补充开始新一轮的检查点。

本阶段暂不包含：

- 删除、清空或编辑历史记录。
- 恢复历史 session 到当前页面。
- 自动保存未完成草稿。
- 自动生成新问题或自动开始下一轮 AI 请求。
- 改动 AI API、prompt、mock 流程或历史保存数据结构。
- 页面大范围 UI 重构。

### 建议任务拆分

阶段开发 session 按以下顺序实现，不要扩展到其他功能：

1. 先阅读 `components/InterviewSimulator.js` 中当前初始化状态、示例填充、生成问题、回答提交、最终评价和历史保存相关状态。
2. 新增一个重置处理函数，例如 `handleResetInterview`，并添加简短中文注释说明它负责清空当前面试状态。
3. 在处理函数中集中清空当前面试相关状态：岗位 JD、简历、问题、回答、提交状态、评价、错误、保存提示和 loading 状态。
4. 保留本地历史记录列表和 localStorage 数据，不调用 `saveInterviewSession`，也不删除 `ai-interview-sessions`。
5. 如果当前页面存在内容，点击重置时使用简单确认；如果页面本来就是空的，可以直接保持空状态。
6. 在页面合适位置新增按钮，文案优先使用 `开始新一轮`；如使用 `清空当前面试`，要避免用户误解为清空历史记录。
7. 如需样式，仅在 `app/globals.css` 做小范围补充，避免 UI 大改。
8. 更新 `docs/DEVELOPMENT_TESTING.md`，补充清空当前面试后的测试路径。
9. 阶段完成或准备 PR 前，按 `AGENTS.md` 的分档收尾规则更新 `docs/PROJECT_STATUS.md` 和 `docs/ROADMAP.md`。

### 验收标准

阶段 10 完成时，应满足：

- 页面中能看到清晰的 `开始新一轮` 或 `清空当前面试` 按钮。
- 点击后当前岗位 JD 和简历被清空。
- 点击后问题列表、回答内容、提交状态、答题进度、最终评价和错误提示被清空。
- 点击后页面回到问题列表未展示的初始状态。
- 点击后本地历史记录仍然存在，历史列表和历史详情不被删除。
- 开发环境下清空后仍可使用 `填入示例 JD/简历`、`使用 Mock 问题`、`填入测试回答` 和 `使用 Mock 评价`。
- 真实 AI 生成问题和最终评价流程不受影响。
- 不调用后端 API、不调用 DeepSeek、不调用 mock 评价、不保存新的历史记录。
- 新增函数或关键逻辑有简短中文注释。
- 没有新增依赖。

### 代码审查关注点

代码审查 session 应重点检查：

- 是否只清空当前面试状态，没有删除 localStorage 历史记录。
- 是否遗漏了回答提交状态、最终评价、错误提示或保存提示。
- 是否没有在重置时触发 AI、mock 评价或历史保存。
- 重置后是否还能正常开始真实 AI 流程和 Mock 快速流程。
- 按钮文案是否避免让用户误解为删除历史记录。
- 是否没有引入新依赖或大范围 UI 重构。

## 阶段 11：错误恢复与文案小修

阶段状态：已完成。当前分支为 `develop-improve-efficiency`。

### 阶段目标

补齐 MVP 的基础错误恢复体验：当生成问题或生成最终评价失败时，用户可以直接重试上一次操作；同时小范围优化页面中的提示文案，让空状态、错误状态、保存状态和关键按钮更清楚。

### 用户价值

用户不需要在 AI 请求失败后重新输入内容或猜下一步该做什么。开发者在测试真实 AI 流程时，也能更快处理偶发失败。文案小修能让当前 MVP 更适合演示和 PR 收尾。

### MVP 范围

本阶段应包含：

- 生成问题失败后显示明确错误提示，并提供 `重试生成问题` 按钮。
- 最终评价失败后显示明确错误提示，并提供 `重试生成评价` 按钮。
- 重试生成问题应复用当前岗位 JD 和简历，仍调用原有 `/api/generate-questions`。
- 重试生成评价应复用当前已提交问答，仍调用原有 `/api/evaluate-interview`。
- 重试按钮不应绕过现有空输入校验、答题提交校验或 loading 状态。
- 小范围优化页面文案，包括空输入提示、AI 请求失败提示、本地保存成功/失败提示、历史空状态和关键按钮文案。
- 文案小修应保持产品语气简洁、直接、鼓励用户继续操作。
- 更新开发测试说明，补充错误重试和文案检查点。

本阶段暂不包含：

- 新增自动重试。
- 新增 toast 组件库或第三方依赖。
- 改动 AI API 协议、prompt 或解析结构。
- 改动 mock 问题、mock 评价的数据结构。
- 改动本地历史记录数据结构。
- 新增文件上传、登录、数据库、多轮追问或单题即时批改。
- 大范围 UI 重构。

### 建议任务拆分

阶段开发 session 按以下顺序实现，不要扩展到其他功能：

1. 先阅读 `components/InterviewSimulator.js` 中生成问题、最终评价、错误提示和 loading 状态逻辑。
2. 识别当前生成问题失败和最终评价失败时分别设置的错误状态。
3. 新增或复用处理函数，让 `重试生成问题` 调用原有生成问题逻辑，不复制一整套 API 请求代码。
4. 新增或复用处理函数，让 `重试生成评价` 调用原有最终评价逻辑，不复制一整套 API 请求代码。
5. 只在对应失败状态下展示重试按钮，loading 时避免重复点击。
6. 小范围调整页面文案，优先改用户看得到的提示，不重写产品定位或长篇说明。
7. 如需样式，仅在 `app/globals.css` 做小范围补充，避免 UI 大改。
8. 更新 `docs/DEVELOPMENT_TESTING.md`，补充重试按钮和文案检查点。
9. 阶段完成或准备 PR 前，按 `AGENTS.md` 的分档收尾规则更新 `docs/PROJECT_STATUS.md` 和 `docs/ROADMAP.md`。

### 验收标准

阶段 11 完成时，应满足：

- 生成问题失败后，页面能看到清楚的失败提示和 `重试生成问题` 按钮。
- 点击 `重试生成问题` 会复用当前岗位 JD 和简历再次请求生成问题。
- 最终评价失败后，页面能看到清楚的失败提示和 `重试生成评价` 按钮。
- 点击 `重试生成评价` 会复用当前已提交问答再次请求最终评价。
- 重试按钮不绕过空输入校验和全部回答已提交校验。
- 请求 loading 期间不会造成重复提交或多个并发请求。
- Mock 问题、Mock 评价、一键提交全部回答和开始新一轮流程不受影响。
- 本地历史保存逻辑和历史列表/详情不受影响。
- 关键文案更清楚，不出现和功能状态矛盾的提示。
- 没有新增依赖，没有改动 AI prompt、API 协议或历史数据结构。

### 代码审查关注点

代码审查 session 应重点检查：

- 重试是否复用现有生成问题和最终评价逻辑，避免复制大段请求代码。
- 重试按钮是否只在失败状态下出现，且 loading 时不会重复触发。
- 错误状态是否区分生成问题失败和最终评价失败，不互相污染。
- 重试最终评价是否仍要求所有题目已提交。
- 文案小修是否没有改变产品范围或引入解释性长文。
- 是否没有顺手改 prompt、API、mock 数据或历史保存结构。
- 是否没有引入新依赖或启动服务。

## 阶段 12：登录入口页面壳

阶段状态：已完成。当前已在 `develop-login-page` 分支实现前端登录入口页壳，为未来账号系统预留入口，但不实现真实账号能力。

### 阶段目标

让用户打开应用后先看到一个更完整的产品入口页面。页面参考 `temp_pics/login_page_reference.png` 的整体感觉：背景图或背景视觉在底层，前景有一个悬浮登录框。用户点击入口按钮后进入现有面试模拟器主界面。

### 用户价值

- 第一屏更像一个完整产品，而不是直接进入工具表单。
- 后续如果要做真实账号系统，可以沿用这个入口位置继续扩展。
- 当前仍保持 MVP 简单，不把真实登录、注册、鉴权和数据库提前引入。

### MVP 范围

本阶段建议包含：

- 新增或调整一个最开始展示的登录入口页面壳。
- 页面包含产品名、简短说明、邮箱输入、密码输入和主按钮。
- 主按钮文案优先使用 `进入体验版`，避免暗示已经完成真实账号系统。
- 可以做前端轻量空输入提示，但输入内容只用于当前页面交互。
- 点击 `进入体验版` 后进入现有面试模拟器主界面。
- 背景视觉和悬浮登录框应适配桌面和移动端。

本阶段暂不包含：

- 真实登录。
- 注册账号。
- 忘记密码。
- 第三方登录。
- 登录 API。
- 数据库。
- session、token、cookie 鉴权。
- API route 访问保护。
- 保存、上传或打印用户密码。
- 修改 DeepSeek API、prompt 或历史记录数据结构。

### 任务拆分建议

1. 先阅读 `README.md`、`AGENTS.md`、`docs/PROJECT_STATUS.md`、`docs/ROADMAP.md` 和 `docs/PRD.md`。
2. 检查当前页面入口结构，决定采用“首页内状态切换”或“单独登录页路由”。如果不确定，优先选择改动更小、不会假装有鉴权的方案。
3. 实现登录入口页壳，并补充中文 file header 和关键函数/整体逻辑注释。
4. 使用清楚克制的文案，避免写 `登录成功`、`账号已验证` 等真实账号含义。
5. 点击入口按钮后进入现有 `InterviewSimulator` 主流程。
6. 确认现有生成问题、回答、最终评价、Mock、历史记录和开始新一轮流程不受影响。
7. 如修改开发测试路径，更新 `docs/DEVELOPMENT_TESTING.md`。
8. 阶段完成或准备 PR 前，按 `AGENTS.md` 的分档收尾规则更新 `docs/PROJECT_STATUS.md` 和 `docs/ROADMAP.md`。

### 验收标准

阶段 12 完成时，应满足：

- 用户打开应用后能看到登录入口页面壳。
- 页面有背景视觉和悬浮登录框，整体参考 `temp_pics/login_page_reference.png`。
- 主按钮使用类似 `进入体验版` 的文案，不暗示真实账号已经可用。
- 不新增登录 API，不保存密码，不打印密码，不连接数据库。
- 点击入口按钮后可以进入现有面试模拟器主界面。
- 进入主界面后，生成问题、回答提交、最终评价、Mock、历史记录和开始新一轮功能保持可用。
- 移动端和桌面端布局不出现明显遮挡、溢出或按钮不可点击。
- 没有新增依赖；如确实需要依赖，先让项目所有者确认并自行安装。

### 代码审查关注点

代码审查 session 应重点检查：

- 是否把“登录入口页壳”和“真实账号系统”区分清楚。
- 是否没有新增真实登录 API、数据库、session/token、cookie 鉴权或 API route 保护。
- 是否没有保存、上传、打印或持久化密码输入。
- 是否没有误改 DeepSeek 调用、prompt、parser、mock 数据或历史记录结构。
- 登录入口是否不会破坏现有主流程状态和开发辅助按钮。
- 页面文案是否没有误导用户以为账号系统已经完成。
- 样式是否响应式可用，没有大范围无关 UI 重构。

## 阶段 13：登录入口和面试主界面路由拆分

阶段状态：已完成。当前已在不做真实账号系统的前提下，把登录入口页壳和模拟面试主界面拆成两个前端路由，让浏览器返回键行为符合用户直觉。

### 背景问题

阶段 12 曾采用 `components/AppEntry.js` 内部状态切换：用户点击 `进入体验版` 后只是从登录入口页壳切换到主界面，没有产生新的浏览器历史记录。因此用户在主界面点击浏览器返回键时，会回到打开本产品之前的页面，而不是回到产品登录入口页。

这不是当前实现的 bug，但从产品体验上看，用户更自然的预期是：

```text
/login -> 点击进入体验版 -> /interview -> 浏览器返回 -> /login
```

### 阶段目标

- 登录入口页壳使用独立路由，优先建议 `/login`。
- 模拟面试主界面使用独立路由，优先建议 `/interview`。
- 访问根路径 `/` 时应有清晰行为，优先建议重定向或跳转到 `/login`。
- 点击 `进入体验版` 后使用 Next.js 路由导航进入 `/interview`。
- 浏览器返回键应从 `/interview` 回到 `/login`。

### MVP 范围

本阶段建议包含：

- 新增或调整 Next.js App Router 页面结构。
- 复用现有 `LoginEntryShell` 和 `InterviewSimulator` 组件。
- 移除或简化只用于首页状态切换的入口组件，例如 `AppEntry`；如果保留，需要更新 file header 说明新职责。
- 更新相关 file header，说明 `/login`、`/interview`、`/` 的关系。
- 更新 README、PROJECT_STATUS 或 DEVELOPMENT_TESTING 中已经过时的“首页状态切换”描述。

本阶段暂不包含：

- 真实登录。
- 注册账号。
- 登录 API。
- 数据库。
- session、token、cookie 鉴权。
- API route 访问保护。
- 保存、上传或打印用户密码。
- 强制未登录用户无法访问 `/interview`。

### 任务拆分建议

1. 先阅读 `README.md`、`AGENTS.md`、`docs/PROJECT_STATUS.md`、`docs/ROADMAP.md` 和 `docs/PRD.md`。
2. 检查 `app/page.js`、`components/AppEntry.js`、`components/LoginEntryShell.js` 和 `components/InterviewSimulator.js` 当前职责。
3. 新增 `app/login/page.js` 挂载登录入口页壳。
4. 新增 `app/interview/page.js` 挂载模拟面试主界面。
5. 调整 `app/page.js`，让根路径有明确入口，优先跳转或重定向到 `/login`。
6. 调整 `LoginEntryShell` 的进入动作，让它使用路由导航到 `/interview`。
7. 删除或简化不再需要的首页状态切换组件，避免冗余代码。
8. 更新相关中文 file header 和关键逻辑注释。
9. 按 `docs/DEVELOPMENT_TESTING.md` 补充或执行路由回归检查。

### 验收标准

阶段 13 完成时，应满足：

- 访问 `/login` 能看到登录入口页面壳。
- 点击 `进入体验版` 后进入 `/interview`。
- 在 `/interview` 点击浏览器返回键，会回到 `/login`。
- 访问 `/` 时有明确行为，且不会出现空白页或重复状态切换。
- `/interview` 中真实 AI、Mock、历史记录、开始新一轮和错误重试流程仍可用。
- 没有新增真实登录、登录 API、数据库、session/token 或 API route 保护。
- 没有保存、上传、打印或持久化密码输入。
- 无冗余的旧入口状态组件或过时 file header。

### 代码审查关注点

代码审查 session 应重点检查：

- 是否确实拆成清晰路由，而不是继续只做同页状态切换。
- 浏览器返回键行为是否能从 `/interview` 回到 `/login`。
- 根路径 `/` 的处理是否简单明确。
- 是否没有把路由拆分误做成真实鉴权系统。
- 是否没有破坏现有面试主流程和开发环境 Mock 按钮。
- 是否清理或更新了 `AppEntry` 等可能过时的入口状态代码。
- README、PROJECT_STATUS、DEVELOPMENT_TESTING 中是否还有“首页状态切换”的过时描述。
## 阶段 14：Supabase Auth 账号系统 MVP

阶段状态：已完成。当前已经在已有 `/login` 和 `/interview` 路由基础上接入 Supabase Auth，完成最小真实账号能力，但不做云端历史记录和复杂账号体系。

### 阶段目标

- `/login` 支持真实邮箱密码登录。
- 支持用户注册，优先在登录页内切换登录/注册模式，避免新增复杂页面。
- 登录成功后进入 `/interview`。
- 未登录访问 `/interview` 时回到 `/login`。
- 已登录用户刷新页面后仍保持登录态。
- 用户可以从主界面登出，登出后回到 `/login`。

### 产品边界

本阶段开始做真实账号系统，但只做账号系统 MVP。账号能力用于保护体验入口和为后续云端历史记录打基础，不改变 AI 面试核心流程。

本阶段建议包含：

- 使用 Supabase Auth。
- 使用已经安装的 `@supabase/supabase-js` 和 `@supabase/ssr`。
- 使用 `.env.local` 中的 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`。
- 登录、注册、登出、登录态保持。
- `/interview` 的访问保护。
- 清楚展示登录、注册、登出、认证失败和 loading 状态。
- 保持当前本地历史记录仍使用 localStorage。

本阶段暂不包含：

- 云端历史记录。
- 用户资料页。
- 忘记密码。
- 邮箱验证流程深度定制。
- 第三方 OAuth 登录。
- 角色权限系统。
- 支付、订阅或额度系统。
- 自建密码哈希、手写 session 或自建用户表。
- 使用或提交 Supabase `service_role` key。
- 修改 DeepSeek API 调用方式。

### 技术原则

- 前端可以使用 Supabase publishable/anon key，但不能使用 `service_role` key。
- 不要把用户密码保存到 localStorage、sessionStorage、数据库、自定义日志或历史记录。
- 不要在控制台打印密码、Supabase token 或完整 session。
- DeepSeek API 仍只允许服务端 API route 调用，不能因为接入账号系统而改成前端直连。
- 如果需要新增环境变量，必须告诉项目所有者手动配置，不要把真实值写进仓库。

### 任务拆分建议

1. 先阅读 `README.md`、`AGENTS.md`、`docs/PROJECT_STATUS.md`、`docs/ROADMAP.md`、`docs/PRD.md` 和 `docs/DEVELOPMENT_TESTING.md`。
2. 检查当前 `/login`、`/interview` 和根路径 `/` 的实现方式。
3. 新增 Supabase client/server/proxy 所需的最小封装文件，并写中文 file header。
4. 将 `LoginEntryShell` 从体验入口表单升级为登录/注册 UI，保留当前视觉风格。
5. 实现登录、注册、登出和错误提示。
6. 保护 `/interview`：未登录时回到 `/login`，已登录时可进入主流程。
7. 在主界面提供清楚的登出入口，不影响现有面试操作。
8. 确认真实 AI、Mock、历史记录、开始新一轮和错误重试流程不受影响。
9. 阶段完成或准备 PR 前，按 `AGENTS.md` 的分档收尾规则更新文档。

### 验收标准

阶段 14 完成时，应满足：

- 新用户可以通过邮箱和密码注册。
- 已注册用户可以登录。
- 登录成功后进入 `/interview`。
- 未登录访问 `/interview` 会回到 `/login`。
- 已登录用户刷新 `/interview` 后仍保持登录态。
- 用户可以登出，登出后回到 `/login`。
- 登录/注册失败时有清楚错误提示。
- localStorage 历史记录仍按当前机制工作，不要求按用户云端隔离。
- 没有保存、打印或持久化用户密码。
- 没有使用 Supabase `service_role` key。
- 没有改 DeepSeek API 的前后端调用边界。

### 代码审查关注点

代码审查 session 应重点检查：

- Supabase key 是否只使用 publishable/anon key，未出现 `service_role`。
- 密码是否没有进入 localStorage、历史记录、日志或自定义数据库。
- `/interview` 保护是否可靠，刷新和直接访问都符合预期。
- 登录、注册、登出 loading 和错误状态是否清楚。
- 是否没有把本阶段扩大到云端历史记录、用户资料页、OAuth 或权限系统。
- 是否没有破坏真实 AI、Mock、历史保存和开发辅助流程。
- README、PROJECT_STATUS、DEVELOPMENT_TESTING 和 PRD 是否同步了账号系统 MVP 的范围。

## 阶段 15：内部测试版上线准备

阶段状态：已完成。当前已经把已完成的核心 MVP 和 Supabase Auth 账号系统准备成可部署、可给少量同学试用的内部测试版文档。仓库侧已补齐部署、环境变量、Supabase Auth URL 配置、内部测试说明和隐私提醒；实际 Vercel 部署、Supabase Dashboard 配置和生产 smoke test 需要项目所有者在外部平台执行。

### 阶段目标

- 选择并配置部署平台，优先建议 Vercel。
- 在部署环境配置 DeepSeek 和 Supabase 所需环境变量。
- 在 Supabase Dashboard 配置生产域名的 Site URL 和 Redirect URLs。
- 明确内部测试版本的用户提示：不要输入特别敏感的个人信息。
- 准备内部测试 checklist，覆盖账号系统、AI 面试主流程、Mock 流程和本地历史记录。
- 确认部署版本能完成从注册登录到生成最终评价的完整流程。

### 产品边界

本阶段是上线准备，不是新功能扩展。目标是让当前产品可以被少量真实用户试用，并暴露真实使用问题。

本阶段建议包含：

- Vercel 项目导入和部署说明。
- 生产环境变量清单。
- Supabase Auth URL 配置说明。
- 内部测试用户说明文案。
- 隐私和敏感信息提醒。
- 部署后 smoke test / 回归测试清单。
- README、PROJECT_STATUS、ROADMAP 和 DEVELOPMENT_TESTING 的必要同步。
- 新增 `docs/INTERNAL_TESTING_RELEASE.md`，集中放内部测试版上线步骤。

本阶段暂不包含：

- 云端历史记录。
- 数据库 schema 设计。
- 历史记录按用户隔离。
- 文件上传。
- 支付、订阅或额度系统。
- App Store 或移动端原生应用。
- 大范围 UI 重构。

### 项目所有者前置准备

开发或部署 session 开始前，项目所有者需要准备：

1. 确认阶段 14 PR 已合并到 `main`，本地 `main` 已更新。
2. 准备 Vercel 账号，并允许 Vercel 访问 GitHub 仓库。
3. 准备生产环境变量：
   - `DEEPSEEK_API_KEY`
   - `DEEPSEEK_MODEL`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
4. 等 Vercel 生成域名后，在 Supabase Auth URL Configuration 中配置：
   - Site URL：生产域名，例如 `https://your-project.vercel.app`
   - Redirect URLs：生产域名通配，例如 `https://your-project.vercel.app/**`
   - 保留本地开发地址：`http://localhost:3000/**`
5. 准备一个测试邮箱，用于注册、登录和验证邮件流程。

详细操作清单见：

```text
docs/INTERNAL_TESTING_RELEASE.md
```

### 内部测试提醒文案

给同学或内部测试用户的说明建议：

```text
这是我的 AI 模拟面试 MVP。你可以注册/登录，输入岗位 JD 和简历文本，生成面试问题，回答后生成最终评价。

目前历史记录暂时保存在当前浏览器本地，没有云端同步。

请不要输入身份证号、家庭住址、完整手机号、真实薪资流水、公司内部资料等特别敏感信息。
```

### 验收标准

阶段 15 完成时，应满足：

- 项目可以在 Vercel 或选定平台成功部署。
- 生产环境变量配置完整，且没有把真实密钥提交到仓库。
- Supabase Auth 生产 URL 和 Redirect URLs 配置正确。
- 生产环境可以注册、登录、刷新保持登录态、登出。
- 未登录访问 `/interview` 会回到 `/login`。
- 登录后可以完整跑通生成问题、回答、最终评价。
- Mock 流程在开发环境仍可用，生产环境不展示开发 Mock 按钮。
- 本地历史记录仍可保存和查看。
- README 或测试文档中有内部测试和隐私提醒。
- `docs/INTERNAL_TESTING_RELEASE.md` 包含部署准备、生产环境变量、Supabase Auth URL 配置、内部测试 checklist、敏感信息提醒和常见问题。

### 代码审查关注点

如果本阶段涉及代码或配置文件改动，代码审查 session 应重点检查：

- 是否没有提交 `.env.local` 或真实密钥。
- 是否没有使用 Supabase `service_role` key。
- 是否没有把部署准备误扩展成云端历史记录或数据库改造。
- 是否没有破坏本地开发流程。
- 文档里的部署步骤、环境变量和隐私提醒是否清楚。

## 阶段 16：基础主页框架

阶段状态：已完成。当前已经把根路径 `/` 从“直接进入登录页”调整为最基础的产品主页。主页只做信息架构和入口，不做复杂营销页、不做新功能组件、不做大范围视觉重构。

### 背景问题

阶段 16 之前，用户输入网站根路径后会进入 `/login`。这对账号系统可用，但产品结构不够自然：用户应该先看到主页，主页再提供登录/注册入口、进入面试入口，以及当前账号状态。

期望的新入口关系：

```text
/ -> 主页
/login -> 登录/注册
/interview -> 受保护的模拟面试工作区
```

### 阶段目标

- 根路径 `/` 展示最基本主页框架。
- 主页保留 `/login` 入口。
- 主页保留 `/interview` 入口。
- 主页显示当前是否处于登录状态；如果已登录，显示账号信息，例如邮箱。
- 未登录时点击主页的 `/interview` 入口，应直接进入 `/login`；未登录直接访问 `/interview` 也必须回到 `/login`。
- 已登录时可以从主页进入 `/interview`。

### MVP 范围

本阶段建议包含：

- 调整 `app/page.js`，让根路径渲染基础主页，而不是直接重定向到 `/login`。
- 主页包含产品名或简短定位、登录/注册入口、进入面试入口、账号状态信息。
- 复用现有 Supabase Auth 登录态读取能力。
- 保留 `/login` 和 `/interview` 的独立路由。
- 保留 `/interview` 的访问保护，未登录用户不能进入。
- 更新相关中文 file header。
- 小范围补充样式即可，避免大范围 UI 重构。

本阶段暂不包含：

- 营销型 landing page。
- 复杂首页组件。
- 用户资料页。
- 云端历史记录。
- 文件上传。
- 支付、订阅或额度系统。
- 改动 DeepSeek API、prompt 或历史记录数据结构。

### 任务拆分建议

1. 先阅读 `README.md`、`AGENTS.md`、`docs/PROJECT_STATUS.md`、`docs/ROADMAP.md`、`docs/PRD.md` 和 `docs/DEVELOPMENT_TESTING.md`。
2. 检查当前 `app/page.js`、`app/login/page.js`、`app/interview/page.js`、`proxy.js` 和 Supabase server client 的职责。
3. 将根路径 `/` 改为基础主页。
4. 在主页读取当前登录状态；已登录时显示账号信息，未登录时显示未登录状态。
5. 主页提供 `/login` 和 `/interview` 两个清晰入口。
6. 保证未登录用户无法进入 `/interview`：主页点击 `/interview` 入口时直接进入 `/login`，直接访问 `/interview` 时也由路由保护回到 `/login`。
7. 更新 README、PROJECT_STATUS、DEVELOPMENT_TESTING 和 PRD 中关于根路径的描述。
8. 阶段完成或准备 PR 前，按 `AGENTS.md` 的分档收尾规则更新文档。

### 验收标准

阶段 16 完成时，应满足：

- 访问 `/` 看到基础主页，而不是直接进入 `/login`。
- 主页能看到登录/注册入口。
- 主页能看到进入面试入口。
- 未登录时主页明确显示未登录状态。
- 已登录时主页显示当前账号信息，例如邮箱。
- 未登录时点击主页的 `/interview` 入口会直接进入 `/login`；未登录直接访问 `/interview` 也会回到 `/login`。
- 已登录时可以从主页进入 `/interview`。
- `/login` 注册/登录、`/interview` 面试主流程、登出和登录态保持不受影响。
- 没有新增依赖，没有改 DeepSeek API、prompt 或历史记录数据结构。

### 代码审查关注点

代码审查 session 应重点检查：

- 根路径是否不再直接重定向到 `/login`。
- `/login` 和 `/interview` 入口是否都保留。
- 未登录用户点击主页 `/interview` 入口是否直接进入 `/login`，且直接访问 `/interview` 时路由保护仍然有效。
- 登录状态显示是否不泄露敏感信息，只显示必要账号信息。
- 是否没有把主页做成复杂营销页或引入无关 UI 重构。
- 是否没有破坏 Supabase Auth、DeepSeek API、本地历史记录或开发 Mock 流程。
- README、PROJECT_STATUS、DEVELOPMENT_TESTING 和 PRD 是否同步了新的入口流程。

## 阶段 17：主页封面视觉优化

阶段状态：已完成。当前已经在基础主页上优化首屏视觉，让主页更像一个可展示的产品入口。参考图路径为 `temp_pics/main_page_reference.png`。本阶段只做主页首屏视觉和入口呈现，没有新增复杂功能。

### 参考图

- 参考图路径：`temp_pics/main_page_reference.png`。
- 参考图特征：有顶栏、有大图 hero、有大图中的主要按钮。
- 参考图只用于布局气质和首屏结构参考，不要求像素级还原。

### 阶段目标

- 主页保留顶栏。
- 主页首屏增加一个大图 / hero cover 区域。
- 大图区域内保留当前真实可用入口：`/login` 和 `/interview`。
- 保留登录状态 / 账号信息显示。
- 未登录用户点击主页 `/interview` 入口仍进入 `/login`。
- 已登录用户可以从主页进入 `/interview`。
- 整体风格以青色为主，和 AI、面试、工作、求职准备有隐约关联，但不要太直白。

### 视觉方向

本阶段建议视觉方向：

- 青色或青绿色为主色，但避免整页只有单一青色。
- Hero 图像可以带有抽象的工作流、光线、桌面、准备、数据、对话或职业成长意象。
- 避免过度直白的西装面试官、握手、简历图标堆叠、夸张机器人等素材。
- 页面应显得清爽、可信、轻量，不要像模板化 SaaS 营销页。
- 按钮只保留当前真实可用入口；未来功能按钮先不要做出来。

### MVP 范围

本阶段建议包含：

- 调整 `app/page.js` 的主页结构。
- 调整 `app/globals.css` 中主页相关样式。
- 顶栏保留产品名和必要入口，不做复杂导航。
- Hero 区域包含主标题、简短说明、登录/注册入口、进入面试入口和登录状态。
- 如果使用图片资源，应使用项目内可追踪资源或后续明确的图片路径；不要引用本地临时绝对路径。
- 更新中文 file header 或相关注释。

本阶段暂不包含：

- 生成或接入最终 hero 图片。
- 复杂 landing page 多 section。
- 假的未来功能按钮。
- 用户资料页。
- 云端历史记录。
- 文件上传。
- 支付、订阅或额度系统。
- 改动 DeepSeek API、prompt、Supabase Auth 逻辑或历史记录数据结构。

### 任务拆分建议

1. 先阅读 `README.md`、`AGENTS.md`、`docs/PROJECT_STATUS.md`、`docs/ROADMAP.md`、`docs/PRD.md` 和 `docs/DEVELOPMENT_TESTING.md`。
2. 查看参考图 `temp_pics/main_page_reference.png`，理解“顶栏 + 大图 hero + 大图中的按钮”的首屏结构。
3. 检查当前 `app/page.js` 的基础主页结构和 `app/globals.css` 的主页样式。
4. 优化主页首屏布局，但保留当前 `/login`、`/interview` 和登录状态逻辑。
5. 未登录点击主页 `/interview` 入口仍进入 `/login`，不要破坏 `/interview` 路由保护。
6. 不新增不可用按钮；如果需要暗示未来能力，用非按钮文案或留白，不做可点击假入口。
7. 更新相关文档和测试点。

### 验收标准

阶段 17 完成时，应满足：

- 主页有清晰顶栏。
- 主页首屏有大图 / hero cover 区域。
- Hero 区域保留 `/login` 和 `/interview` 真实入口。
- 页面显示登录状态；已登录时显示必要账号信息，例如邮箱。
- 未登录点击主页 `/interview` 入口进入 `/login`。
- 已登录点击主页 `/interview` 入口进入 `/interview`。
- 视觉风格参考 `temp_pics/main_page_reference.png` 的首屏结构，但不要求像素级还原。
- 风格以青色为主，并与面试、工作或职业准备有隐约关联，不直白堆砌面试元素。
- 没有新增假按钮、复杂 landing page、多余功能入口或大范围业务改动。
- `/login`、`/interview`、Supabase Auth、DeepSeek API、本地历史记录和开发 Mock 流程不受影响。

### 代码审查关注点

代码审查 session 应重点检查：

- 是否参考了 `temp_pics/main_page_reference.png` 的顶栏、hero 和按钮结构。
- 是否只优化主页首屏，没有做复杂 landing page。
- 是否没有新增不可用按钮或假功能入口。
- 未登录与已登录点击 `/interview` 入口的行为是否符合预期。
- 登录状态显示是否不泄露敏感信息。
- 移动端和桌面端是否不出现明显遮挡、溢出或按钮不可点击。
- 是否没有破坏 `/login`、`/interview`、Supabase Auth、DeepSeek API、本地历史记录或开发 Mock 流程。
- 相关文档是否同步，尤其是参考图路径和阶段范围。
## 暂缓事项

暂不优先做：

- AI 逐步提问
- 多轮追问
- 云端历史记录和数据库存储
- 文件上传解析简历或 JD
- 语音或视频面试
- 单题即时 AI 批改
- 复杂 UI 重构
- 历史记录删除、编辑、搜索和云同步

这些方向可以在后续阶段规划时逐项比较，但不要在 ROADMAP 中提前排成固定阶段。

## 推荐 session 启动方式

产品助理 session 用于规划和验收标准：

```text
你是 AI Interview Simulator 的产品助理 session。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md、docs/PRD.md。你的职责是维护产品范围、阶段计划、优先级和验收标准；本轮先不要写功能代码。
```

阶段开发 session 用于完成一个 ROADMAP 阶段。启动时把“[阶段名称]”替换成当前要做的阶段，不要沿用旧阶段名称：

```text
你是 AI Interview Simulator 的阶段开发 session。本轮目标是完成 docs/ROADMAP.md 中的“[阶段名称]”阶段。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md；如果本阶段涉及开发测试流程，也阅读 docs/DEVELOPMENT_TESTING.md。然后按 ROADMAP 的任务拆分和验收标准实现。只有在需要改变产品范围或用户流程时才阅读 docs/PRD.md。不要安装依赖；如果需要依赖，告诉我命令让我自己安装。完成后按 AGENTS.md 的分档收尾规则处理文档，并说明未运行的测试。
```

当前阶段 17 已完成，建议先启动代码审查 session 或按内部测试文档做部署 smoke test。代码审查可以这样启动：

```text
你是 AI Interview Simulator 的代码审查 session。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md、docs/DEVELOPMENT_TESTING.md，然后以 review 姿态检查阶段 17 的当前 diff。重点检查主页是否保留顶栏和 hero cover，/login 与 /interview 是否仍是真实可用入口，未登录和已登录状态行为是否正确，移动端是否无明显遮挡或溢出，以及是否没有新增假按钮、复杂 landing page 或业务逻辑改动。
```

代码审查 session 用于检查阶段开发结果:

```text
你是 AI Interview Simulator 的代码审查 session。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md，然后以 review 姿态检查当前 diff。只有在 diff 涉及产品范围或用户流程时才阅读 docs/PRD.md。优先指出 bug、风险、遗漏测试和文档未同步的问题；不要主动做大范围重构。
```

开发测试 session 可选，用于维护测试流程：

```text
你是 AI Interview Simulator 的开发测试 session。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md、docs/DEVELOPMENT_TESTING.md。你的职责是检查和完善本地开发测试流程、开发辅助按钮边界和回归测试清单。
```

## 更新规则

ROADMAP 不应清空重写。阶段完成后应勾选完成，并调整“当前优先级”和“暂缓事项”。

如果计划变得很长，可以后续新增 `docs/ROADMAP_ARCHIVE.md` 归档旧阶段；当前项目还不需要归档。
