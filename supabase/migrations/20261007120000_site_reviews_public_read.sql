-- Anonymous visitors cannot execute is_admin(), so the combined read policy failed for them (42501).
-- Split it: the public reads published reviews; signed-in users also see all reviews if they are website admins.

drop policy if exists "Anyone can read published reviews" on public.site_reviews;

drop policy if exists "Public reads published reviews" on public.site_reviews;
create policy "Public reads published reviews"
  on public.site_reviews for select
  to anon
  using (published);

drop policy if exists "Signed-in users read published reviews, admins read all" on public.site_reviews;
create policy "Signed-in users read published reviews, admins read all"
  on public.site_reviews for select
  to authenticated
  using (published or public.is_admin('website'));
