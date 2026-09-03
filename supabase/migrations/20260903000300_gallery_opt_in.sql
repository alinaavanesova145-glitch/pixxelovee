-- ════════════════════════════════════════════════════════════
-- Privacy fix: "not shown in the gallery UI" was never the same as
-- private. The old "stories: public read published" policy let anyone
-- with the anon key list every published story directly via the Supabase
-- API — real names, photos, and personal messages included — regardless
-- of whether the landing page gallery chose to display it.
--
-- This adds an explicit gallery_opt_in flag (default false — private by
-- default), tightens the public SELECT policy to require both
-- is_published and gallery_opt_in, and adds a security-definer RPC so a
-- story that isn't opted into the gallery can still be fetched by anyone
-- who has its actual /story/[slug] link. Admin read/insert/update/delete
-- policies are untouched — admins still see every story regardless of
-- opt-in.
--
-- Run this in the Supabase SQL editor after the prior three migrations.
-- ════════════════════════════════════════════════════════════

alter table public.stories
  add column gallery_opt_in boolean not null default false;

drop policy if exists "stories: public read published" on public.stories;

create policy "stories: public read published+opted-in"
  on public.stories for select
  using (is_published = true and gallery_opt_in = true);

-- Lets the public story viewer load a published story by its exact slug
-- even when it isn't opted into the public gallery — same
-- security-definer pattern as increment_story_view in schema.sql.
create or replace function public.get_published_story_by_slug(slug text)
returns setof public.stories
language sql
security definer
set search_path = public
stable
as $$
  select s.*
  from public.stories s
  where s.slug = get_published_story_by_slug.slug
    and s.is_published = true;
$$;

grant execute on function public.get_published_story_by_slug(text) to anon, authenticated;
