# Docs Map

## 文档职责

这是 docs 目录的文档地图。每类信息只在一份主要文档中维护，其他文件只引用，不复制整段状态。

## 默认阅读

新的 AI session 默认只读：

- `AGENTS.md`：项目协作规则和硬性边界。
- `docs/HANDOFF.md`：当前分支、当前任务、建议下个 session 角色和下一步动作。
- `docs/TASKS.md`：已批准的任务卡、范围、非目标、验收标准和状态。

## 按需阅读

- `docs/STATUS.md`：已上线能力、已知限制和残余风险。
- `docs/ROADMAP.md`：未来阶段、优先级、候选方向和暂缓事项。
- `docs/ARCHITECTURE.md`：技术栈、路由、目录结构、数据流和重要文件职责。
- `docs/API.md`：项目 API route 的请求、响应和错误边界。
- `docs/TESTING.md`：当前长期有效的开发测试和回归清单。
- `docs/WORKFLOW.md`：本地运行、环境变量、部署和内部测试流程。
- `docs/PRD.md`：产品目标、用户主流程和 MVP 边界；只有产品边界变化时才读。
- `docs/templates/session-prompts.md`：多 session 启动提示词模板。
- `docs/archive/`：历史材料只写区。所有 AI session 都不得读取、搜索或扫描，但可根据当前已知内容直接创建新的归档文件。

## 维护原则

- 当前状态只写 `HANDOFF`，稳定事实只写 `STATUS`，未来计划只写 `ROADMAP`，已批准任务只写 `TASKS`。
- 当前工作所需信息必须保留在活跃文档中，不得依赖 archive。
- 文档结构或职责变化时更新本文件；普通功能开发不需要机械修改文档地图。

## 旧入口

`docs/PROJECT_STATUS.md`、`docs/DEVELOPMENT_TESTING.md`、`docs/INTERNAL_TESTING_RELEASE.md` 仅作为旧链接兼容入口。阶段 26 完成后，再由用户确认是否删除。
