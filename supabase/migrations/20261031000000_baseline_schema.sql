-- Baseline: snapshot of the live schema (project nlpcntbdhqcmzqnbrkff) as of 2026-10-31.
-- These objects already exist in the live database. Mark this migration as applied there
-- (supabase migration repair --status applied 20261031000000) instead of pushing it.

-- Tables ---------------------------------------------------------------------

create table public.issues (
  id serial primary key,
  issue_number integer not null unique,
  issue_date date not null,
  approved_for_display boolean not null default false,
  order_number integer not null
);

create unique index issues_order_number_key on public.issues using btree (order_number);

create table public.articles (
  id serial primary key,
  title text not null,
  content text not null default '',
  issue_number integer not null references public.issues (issue_number),
  order_in_issue integer not null default 0,
  keywords text not null default '',
  related_images text[] not null default '{}'
);

create table public.button_clicks (
  name text primary key,
  count integer not null default 0
);

-- Functions and triggers -----------------------------------------------------

create or replace function public.increment_button_click(p_name text)
returns void
language plpgsql
security definer
as $$
begin
  insert into button_clicks (name, count)
  values (p_name, 1)
  on conflict (name)
  do update set count = button_clicks.count + 1;
end;
$$;

-- Renumbers issues.order_number by (issue_date, issue_number).
create or replace function public.refresh_issue_order_numbers()
returns trigger
language plpgsql
as $$
begin
  with ranked as (
    select id, row_number() over (order by issue_date asc, issue_number asc) as rn
    from issues
  )
  update issues i
  set order_number = r.rn
  from ranked r
  where i.id = r.id;

  return new;
end;
$$;

create trigger trg_refresh_issue_order_numbers
after insert or update of issue_date on public.issues
for each row execute function public.refresh_issue_order_numbers();

-- Row Level Security ---------------------------------------------------------

alter table public.issues enable row level security;
alter table public.articles enable row level security;
-- Note: RLS is NOT enabled on public.button_clicks in the live database.

create policy "Public read issues" on public.issues
  for select using (approved_for_display = true);
create policy "Allow anon insert issues" on public.issues
  for insert with check (true);
create policy "Allow anon update issues" on public.issues
  for update using (true) with check (true);

create policy "Public read articles" on public.articles
  for select using (true);
create policy "Allow anon insert articles" on public.articles
  for insert with check (true);

-- Storage --------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;
