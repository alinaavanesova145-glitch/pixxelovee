-- ════════════════════════════════════════════════════════════
-- Tighten assets insert policy.
--
-- The original "assets: public insert" policy (with check (true)) let any
-- anonymous caller insert an assets row with ANY asset_type — including
-- 'sprite'/'background'/'sfx', which are meant to be admin-authored scene
-- art, not something the public order builder should ever write. This
-- splits it: anonymous callers may only create the two types the builder
-- actually uploads; everything else requires is_admin().
--
-- Run this in the Supabase SQL editor after supabase/schema.sql.
-- ════════════════════════════════════════════════════════════

drop policy if exists "assets: public insert" on public.assets;

create policy "assets: public insert (client uploads only)"
  on public.assets for insert
  with check (asset_type in ('photo_reference', 'audio_upload'));

create policy "assets: admin insert (scene art)"
  on public.assets for insert
  with check (public.is_admin());
