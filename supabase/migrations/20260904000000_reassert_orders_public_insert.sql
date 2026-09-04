-- ════════════════════════════════════════════════════════════
-- Re-assert the "orders: public insert" policy.
--
-- schema.sql already defines this exact policy (line ~150:
-- `create policy "orders: public insert" on public.orders for insert
-- with check (true);`), and RLS is correctly enabled on the table. But
-- live testing (the coding agent's harness, raw curl with the anon key)
-- found anonymous inserts into `orders` failing with:
--
--   42501: new row violates row-level security policy for table "orders"
--
-- That specific error means Postgres sees RLS enabled and the anon role
-- has table-level grants (otherwise you'd get "permission denied for
-- table orders" instead) -- but no INSERT policy is actually satisfied
-- for that role right now. In other words, this policy isn't live on the
-- database even though it's in schema.sql. Re-running it is a safe
-- no-op if it's somehow already correct, and fixes it if it isn't.
--
-- Run this in the Supabase SQL editor.
-- ════════════════════════════════════════════════════════════

drop policy if exists "orders: public insert" on public.orders;

create policy "orders: public insert"
  on public.orders for insert
  with check (true);
