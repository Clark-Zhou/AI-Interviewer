-- 文件职责：建立按账号隔离的简历元数据、10 份名额约束及私有 Storage 访问规则。
-- 关联文件：lib/server/resumeRepository.js、docs/WORKFLOW.md。
-- 注意事项：先在 Supabase Dashboard 创建私有 interview-resumes 存储桶，再在 SQL Editor 执行本文件；不使用 service_role。

create table if not exists public.resume_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  original_name text not null check (char_length(original_name) between 1 and 180),
  file_type text not null check (file_type in ('pdf', 'docx', 'txt', 'md')),
  size_bytes integer not null check (size_bytes > 0 and size_bytes <= 5242880),
  storage_path text not null unique,
  status text not null default 'pending' check (status in ('pending', 'ready')),
  created_at timestamptz not null default now(),
  constraint resume_storage_path_matches_owner check (
    storage_path = user_id::text || '/' || id::text || '.' || file_type
  )
);

create index if not exists resume_files_user_created_idx
  on public.resume_files (user_id, created_at desc);

alter table public.resume_files enable row level security;
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.resume_files to authenticated;

create policy "resume files select own" on public.resume_files
  for select to authenticated using (user_id = (select auth.uid()));
create policy "resume files insert own pending" on public.resume_files
  for insert to authenticated with check (user_id = (select auth.uid()) and status = 'pending');
create policy "resume files update own" on public.resume_files
  for update to authenticated using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "resume files delete own" on public.resume_files
  for delete to authenticated using (user_id = (select auth.uid()));

-- 同一账号的并发 INSERT 串行检查，pending 记录也占一个名额。
create or replace function public.enforce_resume_file_limit()
returns trigger language plpgsql set search_path = '' as $$
begin
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtext(new.user_id::text));
  if (select count(*) from public.resume_files where user_id = new.user_id) >= 10 then
    raise exception 'resume_limit_reached' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists resume_file_limit_trigger on public.resume_files;
create trigger resume_file_limit_trigger before insert on public.resume_files
  for each row execute function public.enforce_resume_file_limit();

-- Storage 对象必须对应当前账号已预留的元数据行；读取与删除只允许自己的目录。
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
create policy "resume objects delete own" on storage.objects
  for delete to authenticated using (
    bucket_id = 'interview-resumes'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );
