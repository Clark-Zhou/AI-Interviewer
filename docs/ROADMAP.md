# Roadmap

## 文档职责

这个文件记录 AI Interview Simulator 的阶段计划、当前优先级、验收标准、暂缓事项和决策原因。它用于帮助产品助理、阶段开发、代码审查、开发测试等不同 session 对齐“接下来按什么顺序做”。

关联文件：

- `README.md`：项目入口说明，告诉新读者项目是什么、怎么运行。
- `AGENTS.md`：多 session 和 AI agent 协作规则。
- `docs/PROJECT_STATUS.md`：当前事实，记录已经完成什么、当前阶段是什么。
- `docs/PRD.md`：产品范围和需求定义，已降为按需阅读；只有产品目标、用户主流程、MVP 边界或非目标变化时阅读。
- `docs/DEVELOPMENT_TESTING.md`：开发测试流程和开发辅助边界。
- `docs/ROADMAP_ARCHIVE.md`：已完成历史阶段的详细方案归档，不是通用必读。

## 当前推荐方向

阶段 1-22 已完成并合并到 `main`。当前 ROADMAP 不再复述已完成阶段细节；完整功能事实看 `docs/PROJECT_STATUS.md`，历史阶段方案看 `docs/ROADMAP_ARCHIVE.md`。

下一步建议：先由产品助理 session 讨论阶段 23 或下一轮优化方向，再从 `main` 新建功能分支开发。

当前已具备的能力摘要：

- 核心闭环：JD + 简历 -> AI 生成问题 -> 用户回答 -> AI 最终评价。
- 产品入口：主页、登录、受保护面试工作台、新面试页、本地历史页。
- 输入效率：开发 Mock、txt/md 本地导入、PDF/DOCX 纯文本解析。
- 存储边界：历史记录仍在浏览器 localStorage；文件只做一次性解析，不保存原始文件。

## 阶段计划

- [x] 阶段 1-18：核心闭环、本地历史、开发效率、登录、主页和内部测试准备。
- [x] 阶段 19：拆分面试工作台信息架构。
- [x] 阶段 20：优化新面试页面体验。
- [x] 阶段 21：文本文件导入入口 MVP。
- [x] 阶段 22：PDF/DOCX 文档解析入口 MVP。
- [ ] 阶段 23：待产品助理 session 规划。

## 当前优先级

当前优先级：

1. 在 `main` 上保持阶段 22 合并后的状态稳定。
2. 由产品助理 session 讨论并规划阶段 23，不直接沿用阶段 22 的审查任务。
3. 新阶段确定前，先不要启动新的阶段开发 session。
4. 后续开发仍需保持现有边界：不做云端历史记录、云端文件存储、OCR、图片识别、语音/视频面试或未规划的 AI 流程改造。

当前无指定功能分支；如开始新阶段，应从 `main` 新建对应功能分支。

## 已完成阶段说明

阶段 1-22 已完成。当前 ROADMAP 只保留阶段索引和下一步规划信息，避免新 session 为了理解下一步任务而读取大量历史方案。

如需追溯历史阶段的详细目标、任务拆分、验收标准和代码审查关注点，阅读 `docs/ROADMAP_ARCHIVE.md`。

当前已完成阶段的事实状态以 `docs/PROJECT_STATUS.md` 为准；新阶段规划以本文件后续新增的当前阶段章节为准。

## 暂缓事项

暂不优先做：

- AI 逐步提问
- 多轮追问
- 云端历史记录和数据库存储
- 扫描版 PDF OCR、图片简历识别或复杂文件解析
- 语音或视频面试
- 单题即时 AI 批改
- 复杂视觉重构或全站设计系统重构
- 历史记录删除、编辑、搜索和云同步

这些方向可以在后续阶段规划时逐项比较，但不要在 ROADMAP 中提前排成固定阶段。

## 推荐 session 启动方式

产品助理 session 用于规划和验收标准：

```text
你是 AI Interview Simulator 的产品助理 session。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md。你的职责是维护阶段计划、优先级和验收标准；本轮先不要写功能代码。只有当本轮会改变产品目标、用户主流程、MVP 边界或非目标时，才阅读 docs/PRD.md。
```

阶段开发 session 用于完成一个 ROADMAP 阶段。启动时把“[阶段名称]”替换成当前要做的阶段，不要沿用旧阶段名称：

```text
你是 AI Interview Simulator 的阶段开发 session。本轮目标是完成 docs/ROADMAP.md 中的“[阶段名称]”阶段。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md；如果本阶段涉及开发测试流程，也阅读 docs/DEVELOPMENT_TESTING.md。然后按 ROADMAP 的任务拆分和验收标准实现。只有在需要改变产品范围或用户流程时才阅读 docs/PRD.md。不要安装依赖；如果需要依赖，告诉我命令让我自己安装。完成后按 AGENTS.md 的分档收尾规则处理文档，并说明未运行的测试。
```

阶段 22 已合并到 `main`。当前没有指定下一阶段；建议先启动产品助理 session 讨论阶段 23 或下一轮优化方向，再启动阶段开发 session。

代码审查 session 用于检查阶段开发结果:

```text
你是 AI Interview Simulator 的代码审查 session。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md，然后以 review 姿态检查当前 diff。只有在 diff 涉及产品范围或用户流程时才阅读 docs/PRD.md。优先指出 bug、风险、遗漏测试和文档未同步的问题；不要主动做大范围重构。
```

开发测试 session 可选，用于维护测试流程：

```text
你是 AI Interview Simulator 的开发测试 session。请先阅读 README.md、AGENTS.md、docs/PROJECT_STATUS.md、docs/ROADMAP.md、docs/DEVELOPMENT_TESTING.md。你的职责是检查和完善本地开发测试流程、开发辅助按钮边界和回归测试清单。
```

## 更新规则

ROADMAP 不应复述大量历史任务。阶段完成后应勾选完成，并调整“当前优先级”和“暂缓事项”。

当已完成阶段的详细说明变长时，应移入 `docs/ROADMAP_ARCHIVE.md`。ROADMAP 默认只保留当前方向、阶段索引、当前优先级、暂缓事项和 session 启动方式。
