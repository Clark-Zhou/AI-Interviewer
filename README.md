# AI Interview Simulator

AI Interview Simulator 是一个个人 MVP 项目，用于帮助求职者基于目标岗位 JD 和个人简历进行模拟面试准备。

当前核心流程：

```text
JD + 简历 -> AI 生成问题 -> 用户回答 -> AI 最终评价 -> 本地历史记录
```

## 快速开始

项目目录：

```text
/Users/a0000/personal-project/AI-Interview
```

安装依赖和启动服务由项目所有者执行：

```bash
cd /Users/a0000/personal-project/AI-Interview
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
- 可选岗位名称、JD 和简历输入，支持 `.txt` / `.md` 本地导入和文本型 `.pdf` / `.docx` 解析。
- DeepSeek 生成面试问题和最终评价。
- 逐题回答、一键提交、错误重试、开始新一轮。
- 浏览器 localStorage 本地历史记录，支持查看、单条删除、清空和列表收起。
- 开发环境 Mock 问题和 Mock 评价。

## 文档地图

- `docs/README.md`：完整文档地图和职责说明。
- `AGENTS.md`：AI session 协作规则和硬性边界。

新的 AI session 默认先读 `AGENTS.md`、`docs/HANDOFF.md` 和 `docs/TASKS.md`，再按当前任务需要选择专题文档。
