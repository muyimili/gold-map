create table if not exists public.marks (
  id text primary key,
  name text default '',
  note text default '',
  res text default '',
  lat double precision not null,
  lng double precision not null,
  o text default '',
  t bigint default 0
);

create table if not exists public.mark_del (
  id text primary key,
  t bigint default 0
);

alter table public.marks enable row level security;
alter table public.mark_del enable row level security;

drop policy if exists p_marks_sel on public.marks;
drop policy if exists p_marks_ins on public.marks;
drop policy if exists p_marks_upd on public.marks;
drop policy if exists p_marks_del on public.marks;
create policy p_marks_sel on public.marks for select using (true);
create policy p_marks_ins on public.marks for insert with check (true);
create policy p_marks_upd on public.marks for update using (true) with check (true);
create policy p_marks_del on public.marks for delete using (true);

drop policy if exists p_md_sel on public.mark_del;
drop policy if exists p_md_ins on public.mark_del;
create policy p_md_sel on public.mark_del for select using (true);
create policy p_md_ins on public.mark_del for insert with check (true);
