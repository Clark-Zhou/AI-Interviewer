# Handoff

## 文档职责

记录当前交接状态。新 session 默认读本文件；本文件应覆盖更新，不要变成长篇聊天记录。

## 当前状态

- 当前分支：`develop-job-title-field`
- 当前阶段：阶段 24 已完成，待审查和合并。
- 当前任务：新增岗位名称字段已完成。
- 下一步：先审查阶段 24 diff；通过后再做阶段 25。

## 最近完成

- 本次产品经理 session 完成 docs 目录轻量化重构。
- ROADMAP 已瘦身为当前计划文件。
- 历史阶段详情已迁入 `docs/archive/ROADMAP_ARCHIVE.md`。
- 新增轻量文档结构：`STATUS`、`ARCHITECTURE`、`API`、`TESTING`、`WORKFLOW`、`TASKS`、`HANDOFF` 和 session prompt 模板。
- 旧长文档保留兼容提示壳，但新 session 应优先阅读新结构。
- 阶段 24 已新增 `/interview/new` 可选岗位名称 `jobTitle` 输入。
- 新历史记录会保存 `jobTitle`；旧历史记录没有 `jobTitle` 时，历史页标题 fallback 到岗位信息摘要，再 fallback 到“未命名岗位”。
- 生成问题和最终评价 API 已兼容可选 `jobTitle`，不传该字段的旧请求仍可用。

## 当前未完成

- 阶段 25：本地历史记录管理和布局优化，待开发。
- 旧文档兼容入口先使用一段时间，确认新结构稳定后再考虑删除或彻底归档。

## 给下个 session 的提醒

- 默认只读 `AGENTS.md`、`docs/HANDOFF.md`、`docs/TASKS.md`。
- 不要默认读取 `docs/PRD.md` 或 `docs/archive/`。
- 如需了解当前事实，读 `docs/STATUS.md`。
- 阶段 25 的任务边界见 `docs/TASKS.md`，不要回头混做阶段 24 之外的新需求。
- 如需改 API 或模块边界，按任务卡链接读 `docs/API.md` 或 `docs/ARCHITECTURE.md`。
