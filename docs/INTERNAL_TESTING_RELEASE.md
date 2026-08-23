# 内部测试版上线准备

> 文档职责：这份文档用于准备 AI Interview Simulator 的内部测试版上线，覆盖部署准备、生产环境变量、Supabase Auth URL 配置、部署后 smoke test、内部测试 checklist 和敏感信息提醒。

关联文件：

- `README.md`：项目入口说明，保留上线准备摘要并指向本文件。
- `docs/PROJECT_STATUS.md`：记录当前阶段状态和下一步建议。
- `docs/ROADMAP.md`：记录阶段 15 的范围、验收标准和完成状态。
- `docs/DEVELOPMENT_TESTING.md`：记录本地和生产环境测试路径。
- `.env.example`：只放占位环境变量，不能放真实 key。

## 上线边界

阶段 15 只做内部测试版上线准备：

- 使用现有 Next.js App Router 应用。
- 使用现有 DeepSeek 服务端 API route。
- 使用现有 Supabase Auth 邮箱密码账号系统。
- 本地历史记录继续保存在当前浏览器 `localStorage`。
- 不新增云端历史记录、数据库 schema、用户资料页、OAuth、文件上传、支付或权限系统。

## 部署平台建议

优先使用 Vercel，因为当前项目是 Next.js App Router：

1. 项目所有者登录 Vercel。
2. 从 GitHub 导入当前仓库。
3. Framework Preset 选择 `Next.js`。
4. Build Command 使用默认 `npm run build`。
5. Install Command 使用默认 `npm install`。
6. Output Directory 保持默认，不要手动改成静态导出目录。
7. 先完成环境变量配置，再触发生产部署。

如果使用其他平台，需要确认它支持 Next.js App Router、Server Components、API routes 和 Next Proxy。

## 生产环境变量

部署平台需要配置以下环境变量：

```env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
DEEPSEEK_MODEL=deepseek-v4-flash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_or_anon_key
```

配置注意：

- `DEEPSEEK_API_KEY` 只能配置在部署平台环境变量中，不要提交到仓库。
- `DEEPSEEK_MODEL` 可选；如果不配置，代码会使用默认模型。
- `NEXT_PUBLIC_SUPABASE_URL` 必须是完整 URL，例如 `https://your-project-ref.supabase.co`，不能只填 project ref。
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 使用 Supabase publishable 或 anon public key。
- 不要使用、提交或粘贴 Supabase `service_role` key。
- 修改 Vercel 环境变量后，需要重新部署生产环境才会生效。
- `.env.example` 只能保留占位值；`.env.local` 不应提交。

## Supabase Auth URL 配置

拿到生产域名后，在 Supabase Dashboard 配置 Auth URL：

1. 打开 Supabase 项目。
2. 进入 `Authentication` -> `URL Configuration`。
3. 将 `Site URL` 设置为生产域名，例如：

```text
https://your-project.vercel.app
```

4. 在 `Redirect URLs` 中加入生产域名通配：

```text
https://your-project.vercel.app/**
```

5. 保留本地开发地址：

```text
http://localhost:3000/**
```

6. 如果后续绑定自定义域名，也要把自定义域名加入 `Site URL` 和 `Redirect URLs`。

## 部署前检查

部署前先在本地确认：

- `git status --short` 只包含预期改动。
- `.env.local` 没有被 git 跟踪。
- `.env.example` 只有占位值。
- 没有出现 Supabase `service_role` key。
- `npm run build` 可以通过。
- `/interview` 是动态受保护页面，不做静态导出。
- 生产环境不依赖开发 Mock 按钮。

## 部署后 Smoke Test

生产部署完成后，建议按以下顺序做 smoke test：

1. 打开生产根路径，确认会进入 `/login`。
2. 用测试邮箱注册账号。
3. 如果 Supabase 要求邮箱确认，按邮件提示完成确认后再登录。
4. 登录成功后确认进入 `/interview`。
5. 刷新 `/interview`，确认仍保持登录态。
6. 登出后确认回到 `/login`。
7. 未登录直接访问 `/interview`，确认会回到 `/login`。
8. 再次登录后输入岗位 JD 和简历。
9. 点击真实 AI 生成问题，确认能拿到 6 道结构化问题。
10. 填写回答并提交全部回答。
11. 生成最终评价，确认总分、总结、优势、风险点、建议和逐题反馈完整展示。
12. 确认最终评价保存到当前浏览器本地历史记录。
13. 点击历史记录，确认详情可以查看。
14. 点击开始新一轮，确认当前面试状态清空但历史记录保留。
15. 确认生产环境不展示 `填入示例 JD/简历`、`填入测试回答`、`使用 Mock 问题`、`使用 Mock 评价` 等开发辅助按钮。

## 内部测试 Checklist

给少量同学或朋友开放前，项目所有者应确认：

- 生产域名可以正常打开。
- 注册、登录、登出、刷新保持登录态都可用。
- 未登录访问 `/interview` 会回到 `/login`。
- 真实 AI 生成问题和最终评价可用。
- 错误时页面能显示可理解的提示。
- 本地历史记录可以保存和查看。
- 测试用户知道历史记录只保存在当前浏览器本地。
- 测试用户知道不要输入特别敏感信息。
- 已准备反馈收集方式，例如微信群、飞书文档、表单或 issue。

## 给内部测试用户的说明

可以直接发送给测试用户：

```text
这是我的 AI 模拟面试 MVP。你可以注册/登录，输入岗位 JD 和简历文本，生成面试问题，回答后生成最终评价。

目前历史记录暂时保存在当前浏览器本地，没有云端同步。换浏览器、换电脑或清理浏览器数据后，历史记录可能看不到。

请不要输入身份证号、家庭住址、完整手机号、真实薪资流水、公司内部资料、未公开商业信息等特别敏感内容。建议使用脱敏后的简历和岗位信息测试。

如果遇到注册、登录、生成问题、生成评价或历史记录异常，请把页面现象、操作步骤和大致时间反馈给我；不要截图包含敏感简历内容的页面。
```

## 常见问题

如果页面提示 Supabase Auth 配置无效：

- 检查 `NEXT_PUBLIC_SUPABASE_URL` 是否是完整 `https://...supabase.co`。
- 检查 `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` 是否为空。
- 修改部署环境变量后重新部署。

如果登录后回调或刷新异常：

- 检查 Supabase Auth 的 `Site URL` 是否是当前生产域名。
- 检查 `Redirect URLs` 是否包含生产域名通配。
- 如果更换了 Vercel 域名或绑定了自定义域名，同步更新 Supabase 配置。

如果 AI 生成失败：

- 检查部署平台是否配置了 `DEEPSEEK_API_KEY`。
- 检查 DeepSeek key 是否仍可用、额度是否正常。
- 检查服务端日志，但不要把真实 key 或用户敏感内容贴到公开位置。

如果用户看不到历史记录：

- 当前历史记录只保存在浏览器 localStorage。
- 换设备、换浏览器、无痕模式或清理站点数据后，旧历史记录不会同步回来。
