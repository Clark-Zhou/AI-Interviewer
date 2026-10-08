-- 文件职责：建立按账号隔离的简历元数据、并发名额约束及私有 Storage 规则。
-- 关联文件：lib/server/resumeRepository.js、docs/WORKFLOW.md。
-- 注意事项：先创建私有 interview-resumes 桶；本脚本只使用用户会话，不使用 service_role。

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- 服务端专用随机令牌由数据库生成，仅通过 Dashboard 查询后写入服务端 .env.local。
create table if not exists private.resume_api_config (
  id boolean primary key default true check (id),
  token text not null
);
revoke all on private.resume_api_config from public, anon, authenticated;
insert into private.resume_api_config (id, token) values (true, gen_random_uuid()::text)
  on conflict (id) do nothing;

create table if not exists public.resume_files (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  original_name text not null check (char_length(original_name) between 1 and 180),
  file_type text not null check (file_type in ('pdf', 'docx', 'txt', 'md')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  storage_path text not null unique,
  status text not null default 'pending' check (status in ('pending', 'ready', 'cleanup')),
  created_at timestamptz not null default now(),
  constraint resume_storage_path_matches_owner check (
    storage_path = user_id::text || '/' || id::text || '.' || file_type
  )
);
create index if not exists resume_files_user_created_idx
  on public.resume_files (user_id, created_at desc);

alter table public.resume_files enable row level security;
revoke all on public.resume_files from public, anon, authenticated;
grant select on public.resume_files to authenticated;
create policy "resume files select own" on public.resume_files
  for select to authenticated using (user_id = (select auth.uid()));

-- SECURITY DEFINER 函数仅在令牌和当前用户均有效时变更元数据。
create or replace function private.check_resume_api_token(provided text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if provided is null or not exists (
    select 1 from private.resume_api_config where id = true and token = provided
  ) then
    raise exception 'resume_api_unauthorized' using errcode = '42501';
  end if;
end;
$$;
revoke all on function private.check_resume_api_token(text) from public, anon, authenticated;

-- 同一账号的并发预留串行执行；cleanup 不占用名额。
create or replace function public.reserve_resume_file(
  resume_id uuid, resume_name text, resume_type text, resume_size integer, api_token text
) returns void language plpgsql security definer set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
begin
  perform private.check_resume_api_token(api_token);
  if owner_id is null then raise exception 'resume_auth_required' using errcode = '42501'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(owner_id::text));
  if (select count(*) from public.resume_files
      where user_id = owner_id and status in ('pending', 'ready')) >= 10 then
    raise exception 'resume_limit_reached' using errcode = 'P0001';
  end if;
  insert into public.resume_files (
    id, user_id, original_name, file_type, size_bytes, storage_path, status
  ) values (
    resume_id, owner_id, resume_name, resume_type, resume_size,
    owner_id::text || '/' || resume_id::text || '.' || resume_type, 'pending'
  );
end;
$$;
revoke all on function public.reserve_resume_file(uuid,text,text,integer,text) from public, anon;
grant execute on function public.reserve_resume_file(uuid,text,text,integer,text) to authenticated;

create or replace function public.transition_resume_file(
  resume_id uuid, action text, api_token text
) returns void language plpgsql security definer set search_path = '' as $$
declare
  current_status text;
begin
  perform private.check_resume_api_token(api_token);
  if auth.uid() is null then raise exception 'resume_auth_required' using errcode = '42501'; end if;
  select status into current_status from public.resume_files
    where id = resume_id and user_id = auth.uid() for update;
  if current_status is null then raise exception 'resume_not_found' using errcode = 'P0002'; end if;
  if action = 'ready' and current_status = 'pending' then
    update public.resume_files set status = 'ready' where id = resume_id;
  elsif action = 'cleanup' and current_status in ('pending', 'ready', 'cleanup') then
    update public.resume_files set status = 'cleanup' where id = resume_id;
  elsif action = 'purge' and current_status = 'cleanup' then
    delete from public.resume_files where id = resume_id;
  else
    raise exception 'resume_invalid_transition' using errcode = 'P0001';
  end if;
end;
$$;
revoke all on function public.transition_resume_file(uuid,text,text) from public, anon;
grant execute on function public.transition_resume_file(uuid,text,text) to authenticated;

-- 上传只允许已预留路径，删除只允许已进入清理状态的对象。
create policy "resume objects insert reserved" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'interview-resumes'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
    and exists (
      select 1 from public.resume_files r
      where r.storage_path = name and r.user_id = (select auth.uid()) and r.status = 'pending'
    )
  );
create policy "resume objects select own" on storage.objects
  for select to authenticated using (
    bucket_id = 'interview-resumes'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
create policy "resume objects delete cleanup" on storage.objects
  for delete to authenticated using (
    bucket_id = 'interview-resumes'
    and exists (
      select 1 from public.resume_files r
      where r.storage_path = name and r.user_id = (select auth.uid()) and r.status = 'cleanup'
    )
  );
