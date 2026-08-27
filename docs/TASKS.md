# Tasks

## 文档职责

记录当前任务卡和验收标准。新 session 默认读本文件；不要长期保存大量历史任务，完成并稳定后可归档或精简。

## 当前任务表

| 任务 | 状态 | 负责人 | 说明 |
| --- | --- | --- | --- |
| #23 | 已完成 | 产品助理 session | docs 目录轻量化重构和默认阅读规则调整 |
| #24 | 待规划 | 产品助理 session | 下一组阶段方向待讨论 |

## 任务卡 #23：docs 目录轻量化重构

状态：已完成。

目标：把 docs 改造成按角色按需阅读的轻量结构，降低新 session 默认 token 消耗。

已完成：

- 新增 `docs/HANDOFF.md`、`docs/TASKS.md`、`docs/STATUS.md`、`docs/ARCHITECTURE.md`、`docs/API.md`、`docs/TESTING.md`、`docs/WORKFLOW.md` 和 `docs/templates/session-prompts.md`。
- 将 `docs/ROADMAP_ARCHIVE.md` 移入 `docs/archive/ROADMAP_ARCHIVE.md`。
- 将旧 `PROJECT_STATUS`、`DEVELOPMENT_TESTING`、`INTERNAL_TESTING_RELEASE` 改成兼容提示壳。
- 压缩 `README`、`ROADMAP` 和 `PRD`，明确 PRD 与 archive 默认不读。

## 任务卡 #24：下一组阶段规划

状态：未开始。

目标：由产品助理 session 和用户讨论下一组阶段方向，再更新 `docs/ROADMAP.md` 与本文件中的具体任务卡。

建议候选方向：

- 优化已有面试流程体验。
- 增强历史记录能力，例如删除、搜索或恢复历史 session。
- 规划云端历史记录和数据库存储。
- 继续做小范围 UI、文案或错误恢复优化。

默认需要阅读：

- `AGENTS.md`
- `docs/HANDOFF.md`
- `docs/TASKS.md`

按需阅读：

- 产品规划读 `docs/ROADMAP.md`。
- 当前事实读 `docs/STATUS.md`。
- 产品边界变化读 `docs/PRD.md`。

验收标准：

- 下一组阶段方向明确。
- 有清晰任务目标、范围、非目标、验收标准和审查关注点。
- 明确开发 session 需要读哪些文件，避免默认读取归档和 PRD。
