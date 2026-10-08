-- 文件职责：建立按账号隔离的完整面试历史表及列表索引。
-- 关联文件：lib/server/interviewHistory.js、app/api/history/、docs/WORKFLOW.md。
-- 注意事项：由项目所有者在 Supabase SQL Editor 执行；不使用 service_role。

create table if not exists public.interview_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  local_id text,
  job_title text not null default '',
  overall_score integer,
  generation_source jsonb,
  content_hash text not null check (content_hash ~ '^[0-9a-f]{64}$'),
  session_data jsonb not null check (jsonb_typeof(session_data) = 'object'),
  created_at timestamptz not null default now(),
  constraint interview_sessions_local_id_length check (local_id is null or char_length(local_id) between 1 and 128),
  constraint interview_sessions_job_title_length check (char_length(job_title) <= 200),
  constraint interview_sessions_score_range check (overall_score is null or overall_score between 0 and 100),
  constraint interview_sessions_payload_size check (octet_length(session_data::text) <= 2097152),
  constraint interview_sessions_local_owner_unique unique (user_id, local_id)
);

create index if not exists interview_sessions_user_created_idx
  on public.interview_sessions (user_id, created_at desc, id desc);

alter table public.interview_sessions enable row level security;
revoke all on public.interview_sessions from public, anon, authenticated;
grant select, insert, delete on public.interview_sessions to authenticated;

create policy "interview sessions select own" on public.interview_sessions
  for select to authenticated using (user_id = (select auth.uid()));
create policy "interview sessions insert own" on public.interview_sessions
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "interview sessions delete own" on public.interview_sessions
  for delete to authenticated using (user_id = (select auth.uid()));
