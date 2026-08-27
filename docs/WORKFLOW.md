# Workflow

## 文档职责

记录本地运行、环境变量、依赖安装、部署和内部测试流程。需要运行项目、配置环境或准备测试版时读本文件。

## 本地项目位置

```text
/Users/a0000/personal-project/AI-Interview_Simulator
```

如果目录不确定，先运行：

```bash
pwd
git rev-parse --show-toplevel
```

## 本地运行

依赖安装由项目所有者执行：

```bash
npm install
```

启动开发服务也应由项目所有者执行，除非明确要求 AI agent 代为启动：

```bash
npm run dev
```

默认访问：

```text
http://localhost:3000
```

## 环境变量

本地 `.env.local` 需要：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
```

注意：

- `.env.local` 不提交到 git。
- 不要提交 DeepSeek key、Supabase `service_role` key 或其他敏感配置。
- `NEXT_PUBLIC_SUPABASE_URL` 必须是完整 URL。
- 修改环境变量后通常要重启 dev server。

## 部署准备

部署平台需要配置：

- `DEEPSEEK_API_KEY`
- `DEEPSEEK_MODEL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Supabase Auth 需要配置：

- Site URL 指向生产域名。
- Redirect URLs 包含生产域名通配，例如 `https://your-project.vercel.app/**`。
- 本地开发地址 `http://localhost:3000/**` 可继续保留。

## 内部测试提醒

- 历史记录只保存在当前浏览器本地。
- 不要输入特别敏感的真实简历或公司内部信息。
- PDF/DOCX 只做纯文本解析，不支持扫描件 OCR。
- 测试时至少覆盖注册/登录、生成问题、提交回答、最终评价、保存历史和文件解析。

## AI Agent 边界

- 不擅自安装依赖。
- 不默认启动 dev server。
- 多次运行或测试失败时，应停下来和用户讨论。
- 需要新增依赖、外部账号配置或部署平台操作时，只给用户命令和步骤。
