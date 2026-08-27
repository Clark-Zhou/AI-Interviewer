# AI Interview Simulator

AI Interview Simulator 是一个个人 MVP 项目，用于帮助求职者基于目标岗位 JD 和个人简历进行模拟面试准备。

当前核心流程：

```text
JD + 简历 -> AI 生成问题 -> 用户回答 -> AI 最终评价 -> 本地历史记录
```

## 快速开始

项目目录：

```text
/Users/a0000/personal-project/AI-Interview_Simulator
```

安装依赖和启动服务由项目所有者执行：

```bash
npm install
npm run dev
```

本地访问：

```text
http://localhost:3000
```

本地 `.env.local` 需要 DeepSeek 和 Supabase 配置，详见 `docs/WORKFLOW.md`。

## 当前能力

- 主页、登录/注册、受保护面试工作台。
- JD/简历输入，支持 `.txt` / `.md` 本地导入和文本型 `.pdf` / `.docx` 解析。
- DeepSeek 生成面试问题和最终评价。
- 逐题回答、一键提交、错误重试、开始新一轮。
- 浏览器 localStorage 本地历史记录。
- 开发环境 Mock 问题和 Mock 评价。

## 文档地图

默认阅读：

- `AGENTS.md`：AI session 协作规则和硬性边界。
- `docs/HANDOFF.md`：当前交接状态。
- `docs/TASKS.md`：当前任务卡。

按需阅读：

- `docs/README.md`：docs 目录地图。
- `docs/STATUS.md`：当前项目事实。
- `docs/ROADMAP.md`：下一阶段方向。
- `docs/ARCHITECTURE.md`：技术结构和数据流。
- `docs/API.md`：API 契约。
- `docs/TESTING.md`：测试边界和回归清单。
- `docs/WORKFLOW.md`：本地运行、环境变量、部署和内部测试。
- `docs/PRD.md`：产品边界，默认不读。
- `docs/archive/`：历史长文档，默认不读。
