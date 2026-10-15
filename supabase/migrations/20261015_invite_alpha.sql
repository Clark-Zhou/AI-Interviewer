-- 文件职责：受邀邮箱注册限制与每账号每日 AI 调用计数。
-- 关联文件：lib/server/aiRequestGuard.js、docs/WORKFLOW.md。
-- 注意事项：仅在独立内测 Supabase 项目执行；执行后仍须在 Auth Hooks 启用注册 hook。

create table if not exists public.beta_invited_emails (
  email text primary key,
  created_at timestamptz not null default now(),
  constraint beta_invited_emails_normalized check (email = lower(btrim(email)) and email like '%@%')
);
alter table public.beta_invited_emails enable row level security;
revoke all on public.beta_invited_emails from public, anon, authenticated;

-- Supabase Auth 在用户创建前调用；空名单会拒绝所有新注册。
create or replace function public.hook_allow_invited_email(event jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  invited_email text := lower(btrim(event->'user'->>'email'));
begin
  if invited_email is not null and exists (
    select 1 from public.beta_invited_emails where email = invited_email
  ) then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object('error', jsonb_build_object(
    'http_code', 403, 'message', '该邮箱尚未受邀参加内测。'
  ));
end;
$$;
revoke all on function public.hook_allow_invited_email(jsonb) from public, anon, authenticated;
grant execute on function public.hook_allow_invited_email(jsonb) to supabase_auth_admin;

create table if not exists public.daily_ai_calls (
  user_id uuid not null references auth.users(id) on delete cascade,
  day_utc date not null,
  used_count integer not null check (used_count between 1 and 20),
  primary key (user_id, day_utc)
);
alter table public.daily_ai_calls enable row level security;
revoke all on public.daily_ai_calls from public, anon, authenticated;

-- INSERT/UPSERT 在唯一键上串行化，并发时也只有前 20 次能取得名额。
create or replace function public.reserve_daily_ai_call()
returns boolean language plpgsql security definer set search_path = '' as $$
declare
  current_user_id uuid := auth.uid();
  reserved integer;
begin
  if current_user_id is null then return false; end if;
  insert into public.daily_ai_calls (user_id, day_utc, used_count)
  values (current_user_id, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, day_utc) do update
    set used_count = public.daily_ai_calls.used_count + 1
    where public.daily_ai_calls.used_count < 20
  returning used_count into reserved;
  return reserved is not null;
end;
$$;
revoke all on function public.reserve_daily_ai_call() from public, anon;
grant execute on function public.reserve_daily_ai_call() to authenticated;
