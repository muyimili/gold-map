alter table public.marks add column if not exists res text default '';
alter table public.marks add column if not exists o text default '';
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.marks to anon, authenticated;
grant select, insert, update, delete on public.mark_del to anon, authenticated;
