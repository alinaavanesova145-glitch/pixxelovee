# pixxelovee

Custom 16-bit pixel-art memory scenes, delivered as a link. The full loop is
implemented: landing page → order builder (`/create`) → admin review/publish
(`/login`, `/admin`) → the `/story/[id]` interactive viewer. Pricing is four
named packages (Essential Quest / Animated Story Quest / Expanded Quest /
The Ultimate Story, see `src/lib/pricing.ts`) plus a look-alike-avatar
add-on, built for couples, best friends, siblings, or long-distance friends
alike. Typography is `next/font/google` (Fredoka for headings, Quicksand for
body/UI, Press Start 2P demoted to small accent use only — logo, step
numbers, tiny tags). Real pixel art, audio, and scene sprites are still
being sourced separately (see `public/scenes`, `public/sfx`) — nothing
invents placeholders for those.

## Project structure

```
pixxelovee/
├── README.md
├── NEXT_STEPS.md                       # analysis + non-coding to-dos, written mid-build
├── package.json
├── tailwind.config.ts
├── .env.example
├── supabase/
│   ├── schema.sql                      # ✅ orders / stories / assets / profiles + RLS + storage buckets
│   └── migrations/
│       ├── 20260903000000_tighten_assets_insert_policy.sql   # ✅ run after schema.sql
│       ├── 20260903000100_add_package_pricing_columns.sql    # ✅ package_hotspot_count etc. on orders
│       ├── 20260903000200_add_relationship_type.sql          # ✅ relationship_type on orders
│       ├── 20260903000300_gallery_opt_in.sql                 # ✅ see Privacy note below — NOT yet run live
│       ├── 20260904000000_reassert_orders_public_insert.sql  # ✅ live — confirmed via curl + real submit
│       └── 20260906000000_customer_order_lookup.sql          # ✅ see Privacy note below — NOT yet run live
├── public/
│   ├── scenes/<vibe>/                  # background + hotspot sprite art — not sourced yet, folders empty
│   └── sfx/                            # not sourced yet, folder empty
│       (fonts are no longer manually hosted — next/font/google self-hosts Fredoka/Quicksand/Press Start 2P)
└── src/
    ├── middleware.ts                   # ✅ gates /admin on profiles.is_admin (must live under src/, not root)
    ├── app/
    │   ├── layout.tsx                  # ✅ root layout, next/font/google variables, site-wide Open Graph
    │   ├── globals.css                 # ✅ Tailwind base only — fonts now loaded via layout.tsx
    │   ├── icon.tsx                    # ✅ code-generated favicon (no binary asset needed)
    │   ├── robots.ts                   # ✅ minimal robots.txt, disallows /admin
    │   ├── not-found.tsx               # ✅ styled 404
    │   ├── page.tsx                    # ✅ landing — composes the sections below
    │   ├── create/                     # ✅ 4-step order builder — success screen now shows the order id
    │   ├── track/page.tsx              # ✅ order id + email -> status lookup, see Privacy note below
    │   ├── login/page.tsx              # ✅ magic-link sign-in for the admin
    │   ├── story/[id]/
    │   │   ├── page.tsx                # ✅ fetches the published story, renders viewer
    │   │   ├── loading.tsx             # ✅ styled loading state (see note below on notFound() + streaming)
    │   │   └── StoryViewer.tsx         # ✅ Pixi.js canvas + Web Audio API
    │   └── admin/
    │       ├── page.tsx                # ✅ orders list with status filtering
    │       └── orders/[orderId]/
    │           ├── page.tsx            # ✅ fetches order + signed asset URLs + linked story
    │           └── OrderDetailView.tsx # ✅ review photos/audio, package/add-ons, edit scene JSON, publish
    ├── components/
    │   ├── landing/
    │   │   ├── Hero.tsx                # ✅ headline + CTA, HeroPixiDemo dimmed to a background layer
    │   │   ├── HeroPixiDemo.tsx        # ✅ procedural Pixi shapes only — no image assets required
    │   │   ├── HowItWorks.tsx          # ✅ 4-step tile pattern
    │   │   ├── PackagesSection.tsx     # ✅ the four package tiers as cards
    │   │   ├── StoryGallery.tsx        # ✅ reads published stories, graceful empty state
    │   │   ├── TrustBadges.tsx         # ✅ real language only, see note below
    │   │   └── Testimonials.tsx        # ✅ empty/placeholder state until real reviews exist
    │   ├── create/
    │   │   └── FileDropzone.tsx        # ✅ drag-drop direct-to-Storage uploader, keyboard-operable
    │   └── story/
    │       ├── AudioUnlockOverlay.tsx  # ✅
    │       ├── SecretMessageModal.tsx  # ✅
    │       └── StoryFooter.tsx         # ✅
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts               # ✅ browser client
    │   │   └── server.ts               # ✅ server component client
    │   ├── audio/AudioManager.ts       # ✅ Web Audio API wrapper
    │   ├── pixi/ambientEffects.ts      # ✅ rain/snow/firefly particles
    │   ├── pricing.ts                  # ✅ the 4 package tiers + avatar add-on (see note below on pricing math)
    │   └── validateStoryScene.ts       # ✅ structural check before an admin publishes scene JSON
    └── types/
        ├── story.ts                   # ✅ StoryScene / Hotspot shape
        └── order.ts                   # ✅ OrderDraft, OrderRow, AssetRow, RelationshipType shapes
```

Everything above is now built. What's left is non-coding: real pixel art/audio,
a live Supabase project with the schema + all three migrations run, and an
end-to-end pass with real data (see `NEXT_STEPS.md` for the fuller punch list).

**Pricing math note:** `REDESIGN_AND_PACKAGES.md`'s formula ("$40 base + $5/hotspot
for 6–10") doesn't actually reconcile to its own four listed prices — at $5/hotspot,
10 hotspots computes to $65, colliding with Animated Story Quest's price, and The
Ultimate Story computes to $95, not $100. `lib/pricing.ts` treats the four *named*
prices as ground truth (they're described as real, tested pricing) and looks them
up directly rather than deriving from a per-hotspot rate — the real numbers only
reconcile at $6/hotspot for the 6–10 range, not $5.

**Trust badge note (resolved):** an earlier pass flagged that "Private, Unlisted
Story Link" wasn't accurate, since `StoryGallery` publicly listed every published
story. This is now actually fixed at the RLS level, not just softened in copy — see
**Privacy: gallery opt-in** below. "Delivered As Your Own Story Link" is kept as
the trust badge wording either way; feel free to restore a stronger privacy claim
in that badge now that it's true.

## Privacy: gallery opt-in (migration `20260903000300`)

Being "not shown in the landing page gallery" was never the same as being
private — the old `stories: public read published` RLS policy let anyone with the
public anon key list every published story directly via the Supabase API (real
names, photos, personal messages included), regardless of what the UI chose to
display. Fixed:

- `stories.gallery_opt_in` (boolean, default `false`) — a story is private-link-only
  unless an admin explicitly opts it into the public gallery.
- The public SELECT policy now requires `is_published = true AND gallery_opt_in =
  true`. Admin read/insert/update/delete policies are unaffected — admins still see
  every story regardless of opt-in.
- A new security-definer RPC, `get_published_story_by_slug(slug)`, lets the
  `/story/[id]` viewer load any published story by its exact slug — opted into the
  gallery or not — the same way `increment_story_view` already bypasses RLS for the
  view counter. `src/app/story/[id]/page.tsx` calls this RPC instead of a direct
  `.from('stories')` select (in both the page body and `generateMetadata`).
- `OrderDetailView.tsx`'s publish flow has a "Feature this on the landing page
  gallery" checkbox, unchecked by default, that sets `gallery_opt_in`. Editing an
  already-published story prefills the checkbox from its current value rather than
  silently resetting it on republish.
- `StoryGallery.tsx` needed no code change — it already selects `is_published`
  stories through the anon-key server client (confirmed: `SUPABASE_SERVICE_ROLE_KEY`
  is never imported anywhere in `src/`, so nothing bypasses RLS), and the tightened
  policy now naturally limits that query to opted-in rows.

**This migration has not been run against the live project yet** — confirmed via a
direct REST check: `stories.gallery_opt_in` doesn't exist and
`get_published_story_by_slug` isn't found in the schema cache. Until it's run,
`/story/[id]` fails safe (renders "not found" rather than erroring, since a missing
RPC returns an error object, not a thrown exception) instead of crashing. Run
`supabase/migrations/20260903000300_gallery_opt_in.sql` in the SQL editor, then a
direct anon `GET /rest/v1/stories?select=id` should return `[]` for a
non-opted-in story while its `/story/[slug]` page still loads.

Build config that a `create-next-app` scaffold normally generates
(`tsconfig.json`, `next.config.js`, `postcss.config.js`, `.gitignore`) has
been added by hand so the project actually runs — verified with `tsc --noEmit`
and a local `next dev` smoke test against a real (empty) Supabase project.

**Known quirk found during that test:** `/story/[id]` has a `loading.tsx`,
which makes Next.js stream the response. For an unknown slug, the page's own
`notFound()` call still renders the styled not-found content correctly, but
because the 200 status was already flushed with the initial streamed shell,
the HTTP status code stays 200 instead of becoming 404. This is a known
Next.js App Router streaming/`notFound()` interaction, not a bug in this
code — removing `loading.tsx` would fix the status code but lose the styled
loading state. Left as-is; worth knowing if a search engine or link-preview
bot ever depends on the real status code for a dead story link.

## Customer order lookup (migration `20260906000000`)

Customers submit orders anonymously — no accounts, no sign-in — and until now had
no way to see their own data again after hitting submit; only admins could read
`orders`. `get_order_by_id_and_email(order_id, customer_email)` fixes that without
ever adding a general SELECT policy on `orders` (which would let anyone list
*every* order via `GET /rest/v1/orders`, not just their own):

- Same security-definer RPC pattern as `get_published_story_by_slug` — the
  function does the row lookup server-side and only ever returns the one
  matching row, so there's nothing to enumerate.
- "Ownership" is proven by knowing the order id (a random UUID, shown once on
  the `/create` success screen, saved to `submittedOrderId` client-side) *and*
  the checkout email — a second factor in case an id leaks via a shared
  screenshot, matching common "order number + email" tracking UX.
- `/create`'s success screen now displays the order id and links to `/track`.
- `src/app/track/page.tsx` is the lookup page: order id + email in, order
  status/vibe/price/timeline out, plus a link to the published story if one
  exists yet.

**Also not yet run against the live project** (same pattern as the gallery
migration) — confirmed via direct REST: the RPC returns `PGRST202` (function
not found). Verified end-to-end with a real submit-then-track run: submission
succeeds (the separate `orders` RLS fix from `20260904000000` **is** now live —
confirmed both by that Playwright run and a direct anon `curl` insert), the
order id displays and is captured correctly, and `/track` fails safe — shows
"No order matches" rather than erroring or crashing — until the lookup RPC
migration is applied. Run `supabase/migrations/20260906000000_customer_order_lookup.sql`
in the SQL editor, then the same submit-then-track flow should end in "Hi
{name}" instead.

## How a story gets built

An admin reviews an order at `/admin/orders/[orderId]`, uploads the
background/sprite/sfx art to the public `story-assets` bucket by hand, then
pastes a `StoryScene` JSON object (see `src/types/story.ts`) into that page's
scene editor — `src/lib/validateStoryScene.ts` catches structural mistakes
before it saves. Publishing upserts the `stories` row and links it back to
the order. The `/story/[id]` viewer reads that JSON generically — new
stories ship without touching viewer code.

```json
{
  "vibe": "cozy_room",
  "background": { "image": "/scenes/cozy-room/bg.png", "width": 1280, "height": 720 },
  "ambient": { "effect": "snow", "intensity": 0.4 },
  "music": { "url": "https://.../lofi-loop.mp3", "volume": 0.4, "loop": true },
  "hotspots": [
    {
      "id": "guitar",
      "x": 0.22, "y": 0.68, "width": 0.1, "height": 0.16,
      "sprite": "/scenes/cozy-room/guitar.png",
      "hoverSprite": "/scenes/cozy-room/guitar-glow.png",
      "sound": "/sfx/guitar-strum.mp3",
      "label": "the mixtape",
      "message": "Remember that night we stayed up until 3am..."
    }
  ],
  "footerCta": { "text": "Powered by pixxelovee", "url": "/create" }
}
```

`x`/`y`/`width`/`height` are 0–1 fractions of the background image, so
hotspots stay pinned to the art regardless of viewport size.

## Free-tier setup & deploy

**Prerequisites:** Node.js 20+, a GitHub account, a [Supabase](https://supabase.com)
account, a [Vercel](https://vercel.com) account — all free tiers.

### 1. Scaffold + install

```bash
npx create-next-app@latest pixxelovee --typescript --tailwind --app --src-dir --import-alias "@/*"
cd pixxelovee
npm install pixi.js framer-motion @supabase/supabase-js @supabase/ssr
```

Then drop in the files from this delivery (`supabase/schema.sql`,
`middleware.ts`, everything under `src/lib`, `src/types`, `src/app/story/[id]`,
`src/components/story`) at the matching paths.

### 2. Create the Supabase project

1. supabase.com → **New project** (free tier) → note the project URL and anon
   key from **Project Settings → API**.
2. **SQL Editor → New query** → paste `supabase/schema.sql` → **Run**. This
   creates `orders`, `stories`, `assets`, `profiles`, RLS policies, and the
   three storage buckets (`photo-references`, `story-assets`, `audio-uploads`).
   Then run each file under `supabase/migrations/` in order (six so far:
   tightening the `assets` insert policy; adding the package pricing
   columns; adding `relationship_type`; the gallery opt-in privacy fix;
   re-asserting the `orders` public-insert policy; and the customer
   order-lookup RPC — see below).
3. Sign in once as yourself (via a magic-link flow on `/login`, or by adding
   yourself directly under **Authentication → Users → Add user**), then
   promote your own row to admin:
   ```sql
   insert into public.profiles (id, is_admin)
   values ('<your-user-uuid-from-auth.users>', true)
   on conflict (id) do update set is_admin = true;
   ```

### 3. Environment variables

```bash
cp .env.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
Project Settings → API. Add the same two (plus the service role key, if you
add any admin-only route handlers) as Environment Variables in Vercel later.

### 4. Run locally

```bash
npm run dev
```

Insert a test story to see the viewer:

```sql
insert into public.stories (slug, title, is_published, scene_data)
values (
  'test-story',
  'Test',
  true,
  '{"vibe":"cozy_room","background":{"image":"/scenes/cozy-room/bg.png","width":1280,"height":720},
    "ambient":{"effect":"snow","intensity":0.4},"hotspots":[],
    "footerCta":{"text":"Powered by pixxelovee","url":"/create"}}'::jsonb
);
```

Open `http://localhost:3000/story/test-story`. (Drop a placeholder image at
`public/scenes/cozy-room/bg.png` first, or point `background.image` at any
image URL.)

### 5. Push to GitHub

```bash
git init
git add .
git commit -m "Initial pixxelovee scaffold"
gh repo create pixxelovee --private --source=. --push
```

### 6. Deploy to Vercel

1. vercel.com → **Add New Project** → import the GitHub repo.
2. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` under
   **Settings → Environment Variables**.
3. Deploy. The Hobby (free) plan includes SSL and a `*.vercel.app` domain; a
   custom domain is free too (you only pay the registrar).

### 7. Free-tier ceilings to keep in mind

- **Supabase free:** 500MB database, 1GB file storage, 5GB bandwidth/month;
  the project pauses after a week of inactivity and wakes on the next request
  (a few seconds' delay).
- **Vercel Hobby:** 100GB bandwidth/month — comfortable for a low/mid-traffic
  story site. Route handlers run as serverless functions with their own
  per-invocation limits.
- Upgrade only if photo/audio uploads or story traffic actually approach these
  numbers — there's no reason to pay before then.
