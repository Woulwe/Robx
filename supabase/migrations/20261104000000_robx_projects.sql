create table if not exists public.robx_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Новый проект' check (char_length(name) between 1 and 120),
  prompt text not null default '' check (char_length(prompt) <= 4000),
  world jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists robx_projects_user_updated_idx on public.robx_projects(user_id, updated_at desc);
alter table public.robx_projects enable row level security;
grant select, insert, update, delete on public.robx_projects to authenticated;
revoke all on public.robx_projects from anon;
create policy robx_projects_select_own on public.robx_projects for select to authenticated using ((select auth.uid()) = user_id);
create policy robx_projects_insert_own on public.robx_projects for insert to authenticated with check ((select auth.uid()) = user_id);
create policy robx_projects_update_own on public.robx_projects for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy robx_projects_delete_own on public.robx_projects for delete to authenticated using ((select auth.uid()) = user_id);
