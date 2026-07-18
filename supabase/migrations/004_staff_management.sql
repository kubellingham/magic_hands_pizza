-- Let existing admins manage the staff list from the dashboard.
--
-- admin_users previously had no policies (service-role only). Now staff can
-- view, add, and remove staff emails. Safety rails:
--  * only admins pass any of these policies (is_admin() is security definer,
--    so it reads admin_users without recursing through these policies);
--  * an admin cannot delete their own email — no locking yourself out;
--  * emails are stored lowercase so the is_admin() JWT comparison matches.

alter table public.admin_users
  add constraint admin_users_email_lowercase check (email = lower(email));

create policy "staff can view staff list"
  on public.admin_users for select
  to authenticated
  using (public.is_admin());

create policy "staff can add staff"
  on public.admin_users for insert
  to authenticated
  with check (public.is_admin());

create policy "staff cannot remove themselves"
  on public.admin_users for delete
  to authenticated
  using (public.is_admin() and email <> (auth.jwt() ->> 'email'));

grant select, insert, delete on public.admin_users to authenticated;
