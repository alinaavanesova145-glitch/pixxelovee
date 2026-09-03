# pixxelovee

Custom 16-bit pixel-art memory scenes, delivered as a link. The full loop is
implemented: landing page → order builder (`/create`) → admin review/publish
(`/login`, `/admin`) → the `/story/[id]` interactive viewer. Real pixel art,
audio, and fonts are still being sourced separately (see `public/scenes`,
`public/fonts`, `public/sfx`) — nothing invents placeholders for those.

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
│       └── 20260903000000_tighten_assets_insert_policy.sql  # ✅ run after schema.sql
├── public/
│   ├── fonts/                          # Press Start 2P woff2 — not sourced yet, folder empty
│   ├── scenes/<vibe>/                  # background + hotspot sprite art — not sourced yet, folders empty
│   └── sfx/                            # not sourced yet, folder empty
└── src/
    ├── middleware.ts                   # ✅ gates /admin on profiles.is_admin (must live under src/, not root)
    ├── app/
    │   ├── layout.tsx                  # ✅ root layout + site-wide Open Graph metadata
    │   ├── globals.css                 # ✅ Tailwind + pixel font
    │   ├── icon.tsx                    # ✅ code-generated favicon (no binary asset needed)
    │   ├── robots.ts                   # ✅ minimal robots.txt, disallows /admin
    │   ├── not-found.tsx               # ✅ styled 404
    │   ├── page.tsx                    # ✅ landing — hero Pixi demo, gallery, CTA
    │   ├── create/                     # ✅ 4-step order builder (Step1Vibe … Step4EstimateSubmit)
    │   ├── login/page.tsx              # ✅ magic-link sign-in for the admin
    │   ├── story/[id]/
    │   │   ├── page.tsx                # ✅ fetches the published story, renders viewer
    │   │   ├── loading.tsx             # ✅ styled loading state (see note below on notFound() + streaming)
    │   │   └── StoryViewer.tsx         # ✅ Pixi.js canvas + Web Audio API
    │   └── admin/
    │       ├── page.tsx                # ✅ orders list with status filtering
    │       └── orders/[orderId]/
    │           ├── page.tsx            # ✅ fetches order + signed asset URLs + linked story
    │           └── OrderDetailView.tsx # ✅ review photos/audio, edit scene JSON, publish
    ├── components/
    │   ├── landing/
    │   │   ├── HeroPixiDemo.tsx        # ✅ procedural Pixi shapes only — no image assets required
    │   │   └── StoryGallery.tsx        # ✅ reads published stories, graceful empty state
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
    │   ├── pricing.ts                  # ✅ order price/timeline estimate
    │   └── validateStoryScene.ts       # ✅ structural check before an admin publishes scene JSON
    └── types/
        ├── story.ts                   # ✅ StoryScene / Hotspot shape
        └── order.ts                   # ✅ OrderDraft, OrderRow, AssetRow shapes
```

Everything above is now built. What's left is non-coding: real pixel art/audio/fonts,
a live Supabase project with the schema + migration run, and an end-to-end pass with
real data (see `NEXT_STEPS.md` for the fuller punch list).

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
   Then run each file under `supabase/migrations/` in order (currently just
   one, tightening the `assets` insert policy).
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
