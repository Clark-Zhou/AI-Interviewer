# Workflow

## 文档职责

记录本地运行、环境变量、依赖安装、部署和内部测试流程。需要运行项目、配置环境或准备测试版时读本文件。

## 本地项目位置

```text
/Users/a0000/personal-project/AI-Interview
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
- `SUPABASE_RESUME_API_TOKEN`（服务端私有；须与对应 Supabase 项目 SQL 生成的值一致）

### 复用现有 Vercel 项目进行受邀内测

现有正式网址为 `https://ai-interviewer-iota-three.vercel.app/`。2026-10-15 核对时，正式部署对应 `928e80b`；Deployment Protection 已由 Standard Protection 调为 **All Deployments / Require Log In**。在测试者获得正式网址前，须再次从 Vercel 后台确认保护仍覆盖正式网址和 API。该保护可影响外部测试者访问；具体访问方式要在上线验收时核对，不能仅凭本地浏览器测试认为已开放。

为受邀内测新建独立 Supabase 项目，不迁移旧项目数据。按以下顺序由项目所有者在控制台配置：

1. 在新 Supabase 项目执行 `supabase/migrations/20261008_resume_library.sql`、`20261008_interview_history.sql` 和 `20261015_invite_alpha.sql`。创建私有 `interview-resumes` Storage 桶及 5MB/MIME 设置，步骤见下文。SQL 执行后先不要发送邀请。
2. 在 SQL Editor 向 `public.beta_invited_emails` 添加两名测试账号邮箱，统一小写，例如 `insert into public.beta_invited_emails(email) values (lower('tester@example.com'));`。请替换示例邮箱；邮箱只在控制台维护，不提交仓库。表不向网页用户开放读取或修改。
3. 在 **Authentication → Hooks** 启用 **Before User Created** 的 Postgres 函数 `public.hook_allow_invited_email`。空名单会拒绝全部新注册；先分别试一位未受邀和一位受邀邮箱，再开放邀请。已有账号登录不受注册 hook 影响。
4. Auth 的 Site URL 与 Redirect URLs 配置正式网址和当前预览网址（预览域名每次变化时核对）。在 Vercel 的 Preview 环境填入新 Supabase URL/publishable key、相应 `SUPABASE_RESUME_API_TOKEN` 与测试 DeepSeek key，**修改环境变量后重新部署预览**。正式环境在通过预览验收、准备生产发布时再切换到新项目并重新部署。**同一部署的三项 Supabase 值必须指向同一项目**。
5. 新代码在没有 `reserve_daily_ai_call` RPC 时会拒绝 AI 调用（503），不会跳过名额限制。额度按照 UTC 自然日、两个 AI 接口合并计算，每次进入 DeepSeek 前扣一次；上游失败也计数。
6. 在预览部署用两个受邀账号验证注册限制、登录保持、真实 AI、每日额度、云端历史保存失败重试、简历仓库及账号隔离。确认 Review/验收通过后再合并到 `main`，核对生产部署提交、tag 和完整流程。仅打 Git tag 不会让 Vercel 自动部署该 tag。

当前 Vercel 环境变量列表尚未发现 `SUPABASE_RESUME_API_TOKEN`。配置完成前不得把简历仓库记为线上验收通过。`v1.0.0-alpha.1` 是既有代码快照；`alpha.2` 仅在审查与线上验收通过后记录。

Vercel Authentication 的 All Deployments 会要求访问者具备 Vercel 权限；外部测试者的访问方式须在开放前单独确认。可使用限定部署的 Shareable Link，但持有链接的人可访问该部署，应只发给受邀测试者并在结束后撤销。任何访问方式都不替代应用内的邮箱名单与逐接口鉴权。

Supabase Auth 需要配置：

- Site URL 指向生产域名。
- Redirect URLs 包含生产域名通配，例如 `https://your-project.vercel.app/**`。
- 本地开发地址 `http://localhost:3000/**` 可继续保留。

### 简历仓库的 Supabase 配置（项目所有者手动执行）

1. 在 Supabase Dashboard 的 **Storage** 创建名为 `interview-resumes` 的**私有** bucket，不启用 Public。设置单文件上限为 5 MB；允许 MIME 类型 `application/pdf`、`application/vnd.openxmlformats-officedocument.wordprocessingml.document`、`text/plain`、`text/markdown`。
2. 在同一项目的 **SQL Editor** 打开并执行 `supabase/migrations/20261008_resume_library.sql`，创建 `public.resume_files`、账号名额限制和表/Storage RLS 规则。该脚本只需执行一次，不使用 `service_role` key。
3. 在 SQL Editor 运行 `select token from private.resume_api_config where id = true;`，把返回值复制到项目服务端的 `.env.local`：`SUPABASE_RESUME_API_TOKEN=<返回值>`。部署时在服务端环境变量中设置同一值，并重新启动服务。该令牌只用于服务端 RPC，不能使用 `NEXT_PUBLIC_` 前缀，不要提交到 Git 或提供给浏览器。只可由项目所有者在 Dashboard 读取。
4. 使用两个测试账号验收：账号 A 上传并下载简历；账号 B 的仓库应为空，直接访问 A 的 ID 也应返回 404。再检查第 10 份成功、第 11 份拒绝和删除后的补位。

如果桶或 SQL 尚未配置，页面会显示读取/上传失败提示。配置前的构建通过不代表云端功能已验收。

### 云端面试历史的 Supabase 配置（项目所有者手动执行）

1. 在同一 Supabase 项目的 **SQL Editor** 执行 `supabase/migrations/20261008_interview_history.sql`，创建 `public.interview_sessions`、列表索引及按账号隔离的 RLS。只需执行一次；不使用 `service_role` key，也不需要新增环境变量。
2. 使用一个测试账号生成 Mock 最终评价，确认云端保存并能在历史页查看详情；换第二个账号确认不可读取或删除第一账号记录。旧浏览器记录只在用户点击“导入此浏览器历史”并确认后上传。

配置前构建仍可通过，但历史页和最终评价保存会显示云端错误；不要把这种状态记为功能验收通过。

## 内部测试提醒

- 新历史保存在当前 Supabase 账号；旧浏览器历史保留在本地，只有确认后才导入。
- 简历仓库会把上传的原文件保存在当前 Supabase 项目中。受邀内测允许真实材料；注册、新面试和仓库页面会告知文本发送给 DeepSeek、原文件与历史保存在 Supabase。测试前仍建议先用虚构材料核对数据路径。
- PDF/DOCX 只做纯文本解析，不支持扫描件 OCR。
- 测试时至少覆盖注册/登录、生成问题、提交回答、最终评价、保存历史和文件解析。

## AI Agent 边界

AI session 的依赖安装、服务启动、失败处理和外部操作权限统一以 `AGENTS.md` 为准，本文件只维护项目运行与部署流程。
