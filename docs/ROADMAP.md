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

当前 MVP 已经跑通“岗位信息 + 简历 -> 生成问题 -> 逐题回答 -> 最终评价”，并已完成本地历史记录初始化、历史记录列表和详情查看。下一条主线建议先评估是否支持恢复历史 session，而不是马上改成 AI 逐步提问。

原因：

- 历史记录不破坏当前列表式面试流程。
- 历史记录已经沉淀一次完整面试 session 的数据结构。
- 历史记录列表和详情已经可以支撑用户复盘一次完整练习。
- 后续如果改成逐步提问，也可以复用当前 session 数据结构。
- AI 逐步提问会同时影响前端交互、API 协议、prompt、状态管理和最终评价输入，复杂度更高。

## 阶段计划

- [x] 阶段 1：生成面试问题闭环
- [x] 阶段 2：用户逐题回答和提交
- [x] 阶段 3：最终评价 API 和页面展示
- [x] 阶段 4：开发辅助按钮，降低本地测试成本
- [ ] 阶段 5：准备并合并当前用户回答/最终评价分支 PR
- [x] 阶段 6：历史记录初始化
- [x] 阶段 7：历史记录列表和详情查看
- [ ] 阶段 8：评估是否支持恢复历史 session
- [ ] 阶段 9：重新评估是否做 AI 逐步提问或多轮追问

## 当前优先级

当前优先级：

1. 先为当前分支做人工回归测试并准备 PR。
2. 下一个功能分支建议评估是否支持恢复历史 session。
3. 暂不改成 AI 逐步提问。

推荐下一个功能分支：

```text
develop-mvp-history-restore
```

下一步只建议评估和实现“从历史记录恢复到当前页面”的最小能力，不急着接数据库。

## 下一阶段设计：历史记录初始化

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
- 用户登录。
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

## 暂缓事项

暂不优先做：

- AI 逐步提问
- 多轮追问
- 登录注册
- 数据库存储
- 文件上传解析简历或 JD
- 语音或视频面试
- 单题即时 AI 批改
- 复杂 UI 重构
- 历史记录删除、编辑、搜索和云同步

这些方向可以在历史记录基础能力稳定后再评估。

## 推荐 session 启动方式

产品助理 session 用于规划和验收标准：

```text
你是 AI Interview Simulator 的产品助理 session。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md、docs/PRD.md。你的职责是维护产品范围、阶段计划、优先级和验收标准；本轮先不要写功能代码。
```

阶段开发 session 用于完成一个 ROADMAP 阶段。启动时把“[阶段名称]”替换成当前要做的阶段，不要沿用旧阶段名称：

```text
你是 AI Interview Simulator 的阶段开发 session。本轮目标是完成 docs/ROADMAP.md 中的“[阶段名称]”阶段。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md；如果本阶段涉及开发测试流程，也阅读 docs/DEVELOPMENT_TESTING.md。然后按 ROADMAP 的任务拆分和验收标准实现。只有在需要改变产品范围或用户流程时才阅读 docs/PRD.md。不要安装依赖；如果需要依赖，告诉我命令让我自己安装。完成后按 AGENTS.md 的分档收尾规则处理文档，并说明未运行的测试。
```

当前下一阶段可以这样启动：

```text
你是 AI Interview Simulator 的阶段开发 session。本轮目标是评估并实现 docs/ROADMAP.md 中的“恢复历史 session 到当前页面”的最小能力。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md 和 docs/DEVELOPMENT_TESTING.md，然后按 ROADMAP 的任务拆分小步实现。不要安装依赖；如果需要依赖，告诉我命令让我自己安装。
```

代码审查 session 用于检查阶段开发结果：

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
