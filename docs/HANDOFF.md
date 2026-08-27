# Handoff

## 文档职责

记录当前交接状态。新 session 默认读本文件；本文件应覆盖更新，不要变成长篇聊天记录。

## 当前状态

- 当前分支：`main`
- 当前阶段：阶段 23 已完成。
- 当前任务：docs 目录轻量化重构已完成。
- 下一步：从 `main` 新建功能分支，先做阶段 24，再做阶段 25。

## 最近完成

- 本次产品经理 session 完成 docs 目录轻量化重构。
- ROADMAP 已瘦身为当前计划文件。
- 历史阶段详情已迁入 `docs/archive/ROADMAP_ARCHIVE.md`。
- 新增轻量文档结构：`STATUS`、`ARCHITECTURE`、`API`、`TESTING`、`WORKFLOW`、`TASKS`、`HANDOFF` 和 session prompt 模板。
- 旧长文档保留兼容提示壳，但新 session 应优先阅读新结构。

## 当前未完成

- 阶段 24：新增岗位名称字段，待开发。
- 阶段 25：本地历史记录管理和布局优化，待开发。
- 旧文档兼容入口先使用一段时间，确认新结构稳定后再考虑删除或彻底归档。

## 给下个 session 的提醒

- 默认只读 `AGENTS.md`、`docs/HANDOFF.md`、`docs/TASKS.md`。
- 不要默认读取 `docs/PRD.md` 或 `docs/archive/`。
- 如需了解当前事实，读 `docs/STATUS.md`。
- 阶段 24/25 的任务边界见 `docs/TASKS.md`，不要一次混做两个阶段。
- 如需改 API 或模块边界，按任务卡链接读 `docs/API.md` 或 `docs/ARCHITECTURE.md`。
