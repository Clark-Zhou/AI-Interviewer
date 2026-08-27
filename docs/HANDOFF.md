# Handoff

## 文档职责

记录当前交接状态。新 session 默认读本文件；本文件应覆盖更新，不要变成长篇聊天记录。

## 当前状态

- 当前分支：`optimize-local-history`
- 当前阶段：阶段 24/25 已完成并审查，待 PR 合并。
- 当前任务：本地 history 优化阶段 24/25 已完成并审查。
- 下一步：准备 `optimize-local-history` 分支 PR，合并后回到 `main` 再规划阶段 26。

## 最近完成

- 本次产品经理 session 完成 docs 目录轻量化重构。
- ROADMAP 已瘦身为当前计划文件。
- 历史阶段详情已迁入 `docs/archive/ROADMAP_ARCHIVE.md`。
- 新增轻量文档结构：`STATUS`、`ARCHITECTURE`、`API`、`TESTING`、`WORKFLOW`、`TASKS`、`HANDOFF` 和 session prompt 模板。
- 旧长文档保留兼容提示壳，但新 session 应优先阅读新结构。
- 阶段 24 已新增 `/interview/new` 可选岗位名称 `jobTitle` 输入。
- 新历史记录会保存 `jobTitle`；旧历史记录没有 `jobTitle` 时，历史页标题 fallback 到岗位信息摘要，再 fallback 到“未命名岗位”。
- 生成问题和最终评价 API 已兼容可选 `jobTitle`，不传该字段的旧请求仍可用。
- 阶段 25 已支持 `/interview/history` 单条删除、清空全部、删除确认和左侧列表收起/展开。
- 历史左侧列表已简化为岗位标题、时间和分数；Mock/AI 来源保留在右侧详情。

## 当前未完成

- 旧文档兼容入口先使用一段时间，确认新结构稳定后再考虑删除或彻底归档。

## 给下个 session 的提醒

- 默认只读 `AGENTS.md`、`docs/HANDOFF.md`、`docs/TASKS.md`。
- 不要默认读取 `docs/PRD.md` 或 `docs/archive/`。
- 如需了解当前事实，读 `docs/STATUS.md`。
- 阶段 24/25 已完成并审查；后续如继续开发，请先由产品助理 session 更新新的任务卡。
- 如需改 API 或模块边界，按任务卡链接读 `docs/API.md` 或 `docs/ARCHITECTURE.md`。
