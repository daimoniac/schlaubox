-- SchlauBox initial schema

create type public.scan_status as enum ('uploading', 'processing', 'ready', 'failed');
create type public.subject_type as enum (
  'deutsch', 'mathematik', 'sachkunde', 'englisch',
  'kunst', 'musik', 'sport', 'sonstiges'
);
create type public.insight_level as enum ('stärke', 'schwäche', 'neutral');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  consent_given_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  birth_year int not null check (birth_year >= 2000 and birth_year <= 2100),
  school_type text default 'grundschule',
  created_at timestamptz not null default now()
);

create table public.scans (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children (id) on delete cascade,
  storage_path text not null,
  status public.scan_status not null default 'uploading',
  scanned_at timestamptz not null default now(),
  error_message text
);

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null unique references public.scans (id) on delete cascade,
  subject public.subject_type not null,
  subject_override public.subject_type,
  grade_or_score text,
  raw_extraction jsonb,
  summary_de text,
  confidence numeric(3,2),
  created_at timestamptz not null default now()
);

create table public.topic_insights (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses (id) on delete cascade,
  topic text not null,
  level public.insight_level not null,
  explanation_de text not null
);

create index children_parent_id_idx on public.children (parent_id);
create index scans_child_id_idx on public.scans (child_id);
create index scans_status_idx on public.scans (status);
create index analyses_scan_id_idx on public.analyses (scan_id);
create index topic_insights_analysis_id_idx on public.topic_insights (analysis_id);

alter table public.profiles enable row level security;
alter table public.children enable row level security;
alter table public.scans enable row level security;
alter table public.analyses enable row level security;
alter table public.topic_insights enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "children_select_own" on public.children
  for select using (auth.uid() = parent_id);

create policy "children_insert_own" on public.children
  for insert with check (auth.uid() = parent_id);

create policy "children_update_own" on public.children
  for update using (auth.uid() = parent_id);

create policy "children_delete_own" on public.children
  for delete using (auth.uid() = parent_id);

create policy "scans_select_own" on public.scans
  for select using (
    exists (
      select 1 from public.children c
      where c.id = scans.child_id and c.parent_id = auth.uid()
    )
  );

create policy "scans_insert_own" on public.scans
  for insert with check (
    exists (
      select 1 from public.children c
      where c.id = scans.child_id and c.parent_id = auth.uid()
    )
  );

create policy "scans_update_own" on public.scans
  for update using (
    exists (
      select 1 from public.children c
      where c.id = scans.child_id and c.parent_id = auth.uid()
    )
  );

create policy "scans_delete_own" on public.scans
  for delete using (
    exists (
      select 1 from public.children c
      where c.id = scans.child_id and c.parent_id = auth.uid()
    )
  );

create policy "analyses_select_own" on public.analyses
  for select using (
    exists (
      select 1 from public.scans s
      join public.children c on c.id = s.child_id
      where s.id = analyses.scan_id and c.parent_id = auth.uid()
    )
  );

create policy "analyses_update_own" on public.analyses
  for update using (
    exists (
      select 1 from public.scans s
      join public.children c on c.id = s.child_id
      where s.id = analyses.scan_id and c.parent_id = auth.uid()
    )
  );

create policy "topic_insights_select_own" on public.topic_insights
  for select using (
    exists (
      select 1 from public.analyses a
      join public.scans s on s.id = a.scan_id
      join public.children c on c.id = s.child_id
      where a.id = topic_insights.analysis_id and c.parent_id = auth.uid()
    )
  );

insert into storage.buckets (id, name, public)
values ('scans', 'scans', false)
on conflict (id) do nothing;

create policy "scans_storage_select_own" on storage.objects
  for select using (
    bucket_id = 'scans'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "scans_storage_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'scans'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "scans_storage_update_own" on storage.objects
  for update using (
    bucket_id = 'scans'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "scans_storage_delete_own" on storage.objects
  for delete using (
    bucket_id = 'scans'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

revoke execute on function public.handle_new_user() from public, anon, authenticated;
