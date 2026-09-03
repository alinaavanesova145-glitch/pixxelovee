# pixxelovee — full analysis, your to-dos, and a prompt for your agent

Written after reading the actual code in your local `pixxelovee` folder (not just the
build-log screenshot) — every file under `src/`, `supabase/schema.sql`, the config
files, and the empty asset folders.

---

## 1. Full analysis

### Stack

Next.js 15 (App Router) + React 19, TypeScript in strict mode, Tailwind, Supabase
(Postgres + Auth + Storage) with row-level security, Pixi.js v8 for the canvas
viewer, Framer Motion for transitions, raw Web Audio API for sound. No test
framework, no CI, no payment processor. Data model is `orders → stories → assets`,
with admin access gated by a `profiles.is_admin` flag checked through a
security-definer `is_admin()` function (avoids RLS recursion — a genuinely good
pattern).

### What's actually built, and how good it is

- **`supabase/schema.sql`** — solid. Three tables, RLS on all of them, storage
  buckets with size/mime limits on the two publicly-writable ones (`photo-references`,
  `audio-uploads`), a view-count RPC exposed to `anon`. This is better hardened than
  most first-pass schemas.
- **`/create` order builder** (`page.tsx` + 4 step components) — a clean, working
  4-step wizard with real state management, price estimation (`lib/pricing.ts`),
  and direct-to-Supabase-Storage uploads via `FileDropzone.tsx`. The upload status
  is honestly binary (uploading/done/error) rather than a fake progress bar —
  correct given the Storage SDK's actual capabilities.
- **`/story/[id]` viewer** — genuinely well built. Pixi.js app lifecycle is
  cleaned up properly on unmount, hotspots are stored as 0–1 fractions of the
  background so they stay pinned at any viewport size, audio is correctly gated
  behind a real user gesture (`AudioUnlockOverlay`) to satisfy autoplay policies,
  and ambient rain/snow/firefly particles are simple hand-rolled `Graphics`
  primitives rather than a heavy dependency.
- **`lib/supabase/client.ts` / `server.ts`** — standard, correct `@supabase/ssr`
  setup for browser and server contexts.

### Real gaps I found reading the code (not just missing files)

- **`assets` table insert policy is wider than it should be.** `assets: public insert`
  in `schema.sql` is `with check (true))` — any anonymous caller can insert an
  `assets` row with *any* `order_id`/`story_id`/`asset_type`, including `'sprite'`
  or `'background'` (which are meant to be admin-only). They can't write to the
  `story-assets` bucket itself (that's correctly locked to admins), but they can
  spam metadata rows pointing at stories that aren't theirs. Worth tightening to
  restrict `asset_type` to `photo_reference`/`audio_upload` on the public policy.
- **No cleanup for orphaned uploads.** `FileDropzone` uploads straight to Storage
  the moment a file is dropped, keyed to a client-generated `draftId` — before an
  `orders` row exists. If someone uploads photos and abandons the form, those
  files sit in Storage forever. On Supabase's free 1GB storage tier this adds up.
- **No anti-abuse on public writes.** `orders`, `assets`, and the two open storage
  buckets all accept anonymous writes with no auth, no rate limit, and no captcha.
  Someone could script repeated 8MB/15MB uploads and burn through your free-tier
  storage or bandwidth.
- **No confirmation email actually sent.** The submit-success screen says "We'll
  email you once your pixel world is ready" — no email service is wired up
  anywhere in the code, so that promise currently isn't kept. Same for any
  new-order notification to you as the admin.
- **Font mismatch.** The README lists both "Press Start 2P" and "Pixelify Sans" as
  intended fonts, but `globals.css` only declares a `@font-face` for Press Start
  2P, and `public/fonts/` is completely empty — neither font file actually exists
  on disk yet.
- **Small accessibility gap.** `FileDropzone`'s clickable area has `role="button"`
  and `tabIndex={0}` but no `onKeyDown` handler, so it's not actually operable
  from a keyboard despite being marked as a button.
- **No error/loading/not-found pages, no SEO basics.** No `not-found.tsx` (so a
  bad `/story/[id]` falls through to Next's default 404, not a styled one), no
  `loading.tsx`, no favicon, no `robots.txt`/sitemap, no Open Graph image for
  link previews when someone shares a story link.
- **Git has never been initialized properly.** `main` has zero commits — every
  file shows as untracked — and there's a stale `.git/index.lock` left over from
  an earlier interrupted operation, which will block the very next `git` command
  until it's removed.

### What's missing entirely (not stubbed, not present as files)

- `src/app/page.tsx` — **the homepage doesn't exist.** `/` currently 404s.
- `src/app/login/page.tsx` — no sign-in page, even though `middleware.ts`
  already redirects unauthenticated `/admin` visitors here.
- `src/app/admin/page.tsx` and `src/app/admin/orders/[orderId]/page.tsx` — no
  way to see submitted orders, review uploaded reference photos, build/paste a
  scene, or publish a story. Right now there is no way to turn a paid order
  into a live `/story/[id]` link.
- `src/components/landing/HeroPixiDemo.tsx`, `StoryGallery.tsx` — referenced in
  the README's intended structure, not created.
- **`.env.local` still has placeholder values** — no real Supabase project is
  connected, so none of the above has ever run against real data.
- **`public/scenes/*`, `public/fonts/`, `public/sfx/` are all empty.** Four vibe
  folders exist with zero files in them — no backgrounds, no sprites, no fonts,
  no sound effects. Even a finished admin dashboard has nothing to build a scene
  out of yet.
- **No payment collection** — confirmed with you this stays a manual "request a
  quote" flow; you'll invoice separately. Nothing to build here, just noting it's
  intentional, not missing.

---

## 2. What you should do yourself

These aren't coding tasks — they need your account, your judgment, or your money,
so no agent can do them for you.

1. **Create the Supabase project.** supabase.com → New project (free tier) →
   SQL Editor → paste `supabase/schema.sql` → Run. Copy the project URL, anon
   key, and service role key into `.env.local` (replacing the placeholders) and
   into Vercel's environment variables later.
2. **Create a GitHub repo and a Vercel account**, both free, if you don't have
   them already — the README's deploy steps (`gh repo create`, then import into
   Vercel) assume both exist.
3. **Source the actual pixel art and audio.** Four background scenes (cozy
   room, sunset roof, cyberpunk alley, rainy coffee shop) plus hotspot sprites
   and hover-states for each, a handful of short sound effects, and background
   music loops. This is a real content decision — commission a pixel artist
   (itch.io asset packs, Fiverr, a friend), generate placeholders yourself, or
   buy a licensed asset pack. The code expects normalized image paths matching
   `src/types/story.ts` — whatever you use just needs to land in
   `public/scenes/<vibe>/`.
4. **Download the two fonts** — Press Start 2P and Pixelify Sans are both free
   Google Fonts (fonts.google.com). Grab the `.woff2` files and drop them in
   `public/fonts/` under the filenames `globals.css` already expects
   (`PressStart2P-Regular.woff2`), and decide whether Pixelify Sans is actually
   used anywhere or should be dropped from the README.
5. **Decide how customers actually pay you** and get that payment
   link/instructions ready (Venmo, PayPal, Cash App, etc.) — since this stays
   manual, that detail needs to go in your order-confirmation email/page copy.
6. **Write (or approve drafted) privacy/terms copy.** You're collecting real
   photos of customers and the people they're memorializing — even a short,
   honest privacy note about how photos are used and stored is worth having
   before you take real orders.
7. **Buy a domain (optional)** if you want something nicer than
   `*.vercel.app`, and connect it in Vercel once deployed.
8. **Once the agent has built `/login` and `/admin`:** sign in once yourself
   through the magic-link flow, then run the one-time SQL from the README to
   promote your own user row to `is_admin = true`.
9. **Do the first real end-to-end test personally** — submit a real order with
   real photos through `/create`, confirm the row and uploaded files appear in
   Supabase, log into `/admin`, publish a story, open the resulting
   `/story/[id]` link on your phone. Nothing above has been tested against a
   live project yet.

---

## 3. The prompt for your coding agent

Paste the block below into your Claude Code / Antigravity session (the same one
that produced the notes in your screenshot) to continue the build in the right
order. It's written to match how that session has been reporting back to you.

```
ROLE: senior full-stack engineer continuing the pixxelovee build. Read
README.md and every file under src/ and supabase/ before changing anything —
match existing conventions exactly (Tailwind's blush-pink token #FFB6C1,
font-pixel utility, OLED-black backgrounds, rounded-xl bordered cards,
framer-motion page transitions, the honest-status pattern used in
FileDropzone rather than fake progress bars).

Build order — do these in sequence, verify each with `tsc --noEmit` before
moving to the next, and don't touch files that are already ✅ in the README
except where a fix below names them specifically:

1. Git hygiene first. Remove any stale .git/index.lock, then `git init` (if
   needed), stage everything, and make an initial commit — this repo has
   never been committed and that's a real risk to the work already done.

2. src/app/login/page.tsx — magic-link sign-in for the admin, using
   createSupabaseBrowserClient(). Match the dark/pixel aesthetic of the rest
   of the app. This is what middleware.ts already redirects unauthenticated
   /admin visitors to.

3. src/app/admin/page.tsx — orders list. Query `orders` (RLS already limits
   this to admins via is_admin()), show status/vibe/customer/price/created_at,
   link each row to its detail page. Add simple status filtering.

4. src/app/admin/orders/[orderId]/page.tsx — order detail: show character
   details, easter eggs, text prompts; list uploaded photo/audio assets from
   the `assets` table with signed URLs (createSignedUrl against the
   authenticated admin client — no service role key needed, the "admin read"
   storage policies already allow it); a textarea to paste/edit a StoryScene
   JSON object (src/types/story.ts) with basic validation before save; a
   publish action that upserts into `stories` (slug, title, scene_data,
   is_published=true) and links it back via orders.story_id, updating
   orders.status.

5. src/app/page.tsx + src/components/landing/HeroPixiDemo.tsx +
   StoryGallery.tsx — the landing page: hero section with a small looping
   Pixi.js room demo, a gallery section (build it to read published stories
   from Supabase, gracefully show an empty/placeholder state since there
   won't be real stories yet), and a CTA to /create. Root layout.tsx already
   sets global metadata — extend it here with Open Graph tags.

6. Fix the specific gaps below while you're in the relevant files:
   - Tighten the `assets: public insert` RLS policy in schema.sql (new
     migration, don't hand-edit the already-run schema) to restrict
     asset_type to 'photo_reference'/'audio_upload' for anonymous inserts —
     admin-authored 'sprite'/'background'/'sfx' rows should require
     is_admin().
   - Add an onKeyDown handler to FileDropzone's dropzone div (Enter/Space →
     trigger the hidden file input) so it's actually keyboard-operable, not
     just marked as one.
   - Add src/app/not-found.tsx and src/app/story/[id]/loading.tsx styled to
     match the app, plus a favicon and a minimal robots.txt.
   - Resolve the font situation: either add Pixelify Sans's @font-face to
     globals.css and use it somewhere real, or drop the reference from
     README.md if it's not actually needed. (The .woff2 files themselves
     will be added by hand — public/fonts/ is currently empty, don't try to
     fetch or invent font files.)

7. Payment stays manual — do not add Stripe or any checkout. The order
   builder should keep collecting name/email only and the success screen
   should keep saying a human will follow up.

8. Once real Supabase credentials are in .env.local (I'll do this myself),
   smoke-test with a real `next dev` server: submit an order through
   /create end-to-end, sign in through /login, publish a story through
   /admin, and view it at /story/[slug]. Report back honestly what you did
   and didn't verify — same pattern as your last report (Fixed/Added/Not
   tested).

9. Update README.md's ⬜/✅ markers as each piece lands.

Do not invent placeholder pixel art, fonts, or audio files — those are being
sourced separately and will be dropped into public/scenes, public/fonts, and
public/sfx by hand. Leave those folders alone unless a page needs a
temporary/obvious placeholder to render without crashing before real assets
arrive — if so, say clearly which files are placeholders in your report.
```

---

**Suggested order overall:** get your Supabase project and env vars sorted
(#1 in your list) so the agent's step 8 above is actually testable, hand it
the prompt, then handle art/fonts/copy/legal in parallel while it works
through the build order.
