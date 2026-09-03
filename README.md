# pixxelovee

Custom 16-bit pixel-art memory scenes, delivered as a link. Implemented so
far: **DB schema**, **admin auth gate**, the **`/story/[id]` interactive
viewer**, and the **order builder** (`/create`). Landing page and admin
dashboard are still stubbed with an obvious place to go — see Build order in
the agent prompt this project is being driven from.

## Project structure

```
pixxelovee/
├── README.md
├── package.json
├── tailwind.config.ts
├── middleware.ts                       # ✅ gates /admin on profiles.is_admin
├── .env.example
├── supabase/
│   └── schema.sql                      # ✅ orders / stories / assets + RLS + storage buckets
├── public/
│   ├── fonts/                          # Press Start 2P / Pixelify Sans woff2
│   ├── scenes/
│   │   ├── cozy-room/
│   │   ├── sunset-roof/
│   │   ├── cyberpunk-alley/
│   │   └── rainy-coffee-shop/          # background + hotspot sprite art per vibe
│   └── sfx/
└── src/
    ├── app/
    │   ├── layout.tsx                  # ✅ root layout
    │   ├── globals.css                 # ✅ Tailwind + pixel font
    │   ├── page.tsx                    # ⬜ landing page (hero Pixi demo, gallery, CTA)
    │   ├── create/
    │   │   ├── page.tsx                # ✅ implemented — order builder shell (4-step wizard state)
    │   │   ├── Step1Vibe.tsx           # ✅ implemented — vibe & atmosphere picker
    │   │   ├── Step2Character.tsx      # ✅ implemented — character form + drag-drop upload
    │   │   ├── Step3MusicElements.tsx  # ✅ implemented — music + easter eggs + secret-message prompts
    │   │   └── Step4EstimateSubmit.tsx # ✅ implemented — price/timeline estimate + submit
    │   ├── story/[id]/
    │   │   ├── page.tsx                # ✅ implemented — fetches the published story, renders viewer
    │   │   └── StoryViewer.tsx         # ✅ implemented — Pixi.js canvas + Web Audio API
    │   ├── admin/
    │   │   ├── page.tsx                # ⬜ orders list
    │   │   └── orders/[orderId]/page.tsx  # ⬜ review photos, paste/edit scene_data JSON, publish
    │   └── login/page.tsx              # ⬜ magic-link sign-in for the admin
    ├── components/
    │   ├── landing/
    │   │   ├── HeroPixiDemo.tsx        # ⬜ small looping Pixi.js room for the hero section
    │   │   └── StoryGallery.tsx        # ⬜ scroll showcase of past stories
    │   ├── create/
    │   │   └── FileDropzone.tsx        # ✅ implemented — drag-drop direct-to-Storage uploader
    │   └── story/
    │       ├── AudioUnlockOverlay.tsx  # ✅ implemented
    │       ├── SecretMessageModal.tsx  # ✅ implemented
    │       └── StoryFooter.tsx         # ✅ implemented
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts               # ✅ implemented — browser client
    │   │   └── server.ts               # ✅ implemented — server component client
    │   ├── audio/AudioManager.ts       # ✅ implemented — Web Audio API wrapper
    │   ├── pixi/ambientEffects.ts      # ✅ implemented — rain/snow/firefly particles
    │   └── pricing.ts                  # ✅ implemented — order price/timeline estimate
    └── types/
        ├── story.ts                   # ✅ implemented — StoryScene / Hotspot shape
        └── order.ts                   # ✅ implemented — OrderDraft shape for the builder
```

`⬜` files are intentionally left as scaffolding — they follow directly from
the schema and the viewer's `StoryScene` type, but weren't asked for in this
pass.

Build config that a `create-next-app` scaffold normally generates
(`tsconfig.json`, `next.config.js`, `postcss.config.js`, `.gitignore`) has
been added by hand so the project actually runs — verified with `tsc --noEmit`
and a local `next dev` smoke test.

## How a story gets built

The admin dashboard doesn't need a custom scene editor to launch: an admin
builds a `StoryScene` JSON object by hand (see `src/types/story.ts`), uploads
the background/sprite/sfx art to the public `story-assets` bucket, and pastes
the JSON into a new row's `scene_data` column. The `/story/[id]` viewer reads
that JSON generically — new stories ship without touching viewer code.

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
   creates `orders`, `stories`, `assets`, RLS policies, and the three storage
   buckets (`photo-references`, `story-assets`, `audio-uploads`).
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
