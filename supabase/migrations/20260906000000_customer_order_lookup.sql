-- ════════════════════════════════════════════════════════════
-- Let a customer look up their own order without ever exposing a general
-- SELECT policy on `orders` (anon currently has none — by design, since a
-- plain `using (true)` SELECT policy would let anyone list every order
-- via GET /rest/v1/orders, not just "their own"). Same security-definer
-- pattern as get_published_story_by_slug in the gallery_opt_in migration:
-- the function does the row lookup server-side and only ever returns the
-- single matching row, so there's nothing to enumerate.
--
-- Ownership here is proven by knowledge of the order id (a random UUID,
-- shown once on the /create success screen) *and* the email used at
-- checkout — a second factor in case an id leaks via a shared screenshot
-- or link, matching common "order number + email" tracking patterns.
--
-- Run this in the Supabase SQL editor after the prior migrations.
-- ════════════════════════════════════════════════════════════

create or replace function public.get_order_by_id_and_email(order_id uuid, customer_email text)
returns table (
  id uuid,
  created_at timestamptz,
  customer_name text,
  status text,
  vibe text,
  relationship_type text,
  price_estimate numeric,
  timeline_estimate text,
  story_slug text,
  story_is_published boolean
)
language sql
security definer
set search_path = public
stable
as $$
  select
    o.id,
    o.created_at,
    o.customer_name,
    o.status,
    o.vibe,
    o.relationship_type,
    o.price_estimate,
    o.timeline_estimate,
    s.slug as story_slug,
    s.is_published as story_is_published
  from public.orders o
  left join public.stories s on s.id = o.story_id
  where o.id = get_order_by_id_and_email.order_id
    and lower(o.customer_email) = lower(get_order_by_id_and_email.customer_email);
$$;

grant execute on function public.get_order_by_id_and_email(uuid, text) to anon, authenticated;
