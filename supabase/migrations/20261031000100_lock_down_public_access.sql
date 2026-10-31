-- Lock down public (anon key) access. All app writes go through server routes
-- using the service-role key, which bypasses RLS and keeps its grants, so the
-- app keeps working.

-- 1. Remove public write access to issues and articles -----------------------

drop policy if exists "Allow anon insert issues" on public.issues;
drop policy if exists "Allow anon update issues" on public.issues;
drop policy if exists "Allow anon insert articles" on public.articles;

-- Only show articles that belong to a published issue (was: all articles).
drop policy if exists "Public read articles" on public.articles;
create policy "Public read articles" on public.articles
  for select using (
    exists (
      select 1 from public.issues i
      where i.issue_number = articles.issue_number
        and i.approved_for_display = true
    )
  );

-- 2. Turn on RLS for button_clicks (no policies: only the server key can access) --

alter table public.button_clicks enable row level security;

-- 3. Harden functions --------------------------------------------------------

create or replace function public.increment_button_click(p_name text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.button_clicks (name, count)
  values (p_name, 1)
  on conflict (name)
  do update set count = public.button_clicks.count + 1;
end;
$$;

create or replace function public.refresh_issue_order_numbers()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  with ranked as (
    select id, row_number() over (order by issue_date asc, issue_number asc) as rn
    from public.issues
  )
  update public.issues i
  set order_number = r.rn
  from ranked r
  where i.id = r.id;

  return new;
end;
$$;

-- Only the server (service_role) may call these directly.
revoke execute on function public.increment_button_click(text) from public, anon, authenticated;
revoke execute on function public.refresh_issue_order_numbers() from public, anon, authenticated;
grant execute on function public.increment_button_click(text) to service_role;
