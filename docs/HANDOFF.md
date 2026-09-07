# Handoff

## 文档职责

记录即时交接状态。新 session 默认读本文件；每次交接覆盖更新，不累积完整功能史，“最近完成”最多保留 3-5 条。

## 当前状态

- 当前分支：`codex/docs-governance-cleanup`
- 当前阶段：阶段 1-25 已合并；文档治理收尾已完成并修复首轮审查问题，待复审。
- 当前任务：修正项目路径、收敛文档职责、同步多 session 规则和 archive 只写不读约束。
- 建议下个 session 角色：代码审查 session；用户确认并合并后再由产品助理 session 规划阶段 26。
- 下一步：复审当前文档 diff，确认后提交并创建合并到 `main` 的 PR。

## 最近完成

- 阶段 24/25 已通过 PR #8 合并到 `main`。
- 根 README、`AGENTS.md` 和 `WORKFLOW.md` 已统一为实际项目目录。
- 活跃文档已按即时状态、当前任务、稳定事实和未来计划收敛职责。
- 多 session 角色、文档维护责任和 archive 只写不读规则已同步。
- 旧状态兼容入口的过期职责指向已按审查意见修复。

## 当前未完成

- 三个旧文档兼容入口暂时保留；阶段 26 完成后再由用户确认是否删除。

## 给下个 session 的提醒

- 默认只读 `AGENTS.md`、`docs/HANDOFF.md`、`docs/TASKS.md`。
- 所有 session 都不得读取、搜索或扫描 `docs/archive/`；允许根据当前已知内容直接创建新的归档文件。
- 如需了解当前事实，读 `docs/STATUS.md`。
- 后续开发必须以产品助理 session 新建的任务卡为准。
