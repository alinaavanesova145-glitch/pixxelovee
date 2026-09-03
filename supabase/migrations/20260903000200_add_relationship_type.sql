-- ════════════════════════════════════════════════════════════
-- Broaden the order builder beyond couples: record who the story is for.
-- Drives copy only for now — no vibe/package combination is gated by it.
--
-- Run this in the Supabase SQL editor after the previous migrations.
-- ════════════════════════════════════════════════════════════

alter table public.orders
  add column relationship_type text
    check (relationship_type in ('couple', 'best_friends', 'siblings', 'long_distance_friends'));
