-- One row per signed-in user. jsonb columns match the shapes already stored in localStorage.

create table public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  tasks jsonb not null default '[]'::jsonb,
  plan_items jsonb not null default '{}'::jsonb,
  saved_routines jsonb not null default '[]'::jsonb,
  daily_flags jsonb not null default '[]'::jsonb,
  abandon jsonb default null,
  focus_sessions jsonb not null default '[]'::jsonb,
  tombstones jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

grant select, insert, update on table public.user_state to authenticated;

create policy "Users can select their own state"
  on public.user_state
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "Users can insert their own state"
  on public.user_state
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "Users can update their own state"
  on public.user_state
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
