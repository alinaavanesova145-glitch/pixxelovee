-- ════════════════════════════════════════════════════════════
-- Replace the old ad-hoc price/timeline estimate with structured package
-- data. Orders now record which of the four named tiers (Essential Quest,
-- Animated Story Quest, Expanded Quest, The Ultimate Story) was ordered,
-- plus the look-alike avatar add-on, as discrete columns rather than only
-- the computed price_estimate/timeline_estimate strings.
--
-- Run this in the Supabase SQL editor after schema.sql and the previous
-- migration.
-- ════════════════════════════════════════════════════════════

alter table public.orders
  add column package_hotspot_count smallint check (package_hotspot_count in (5, 10)),
  add column package_has_cutscenes boolean not null default false,
  add column package_has_finale boolean not null default false,
  add column has_lookalike_avatar boolean not null default false;
