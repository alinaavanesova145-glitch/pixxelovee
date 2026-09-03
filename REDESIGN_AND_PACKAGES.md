# pixxelovee — redesign brief: interface, packages, fonts

Written after looking at kawaiibox.com (interface reference), your pixxelovee
Instagram (@pixxelovee — 16 followers, 5 posts, brand voice and content
reference), and your Google Form (proven pricing).

## The synthesis I'm proposing

kawaiibox.com and your Instagram are actually two different aesthetics —
kawaiibox is light, pastel, bubble-rounded ("Monthly Happiness!" in soft
lavender on white). Your Instagram is the opposite: dark backgrounds, hot
neon-pink glow, arcade/8-bit energy ("EVERY STORY DESERVES A SAVE FILE").
Your Instagram is also the one with actual brand equity — followers,
posts, a consistent voice people already recognize.

So rather than copy kawaiibox's colors, I'm proposing you take its
**interface structure** — the parts that make it feel like a real,
trustworthy, easy-to-buy-from product page — and apply that structure to
your existing dark neon-arcade identity instead of replacing it:

- A big, bold, actually-readable headline (kawaiibox uses a bubble-rounded
  display font at huge size — yours should too, just in your pink-on-black
  palette instead of lavender-on-white)
- A clear "How It Works" step-by-step section (kawaiibox: Subscribe → We
  Curate → We Pack & Ship → Enjoy)
- A clean pricing/packages grid people can scan in five seconds, instead of
  the current live-calculated dollar estimate
- Trust badges and a testimonials section (kawaiibox: "Our Kawaii Crew
  Speaks!" with Instagram-handle attribution — you already have this exact
  pattern as a highlight tray on your own Instagram)
- Rounded pill buttons with a glow/shadow instead of thin flat borders

One more thing I pulled from Instagram worth flagging: your bio and
highlights position this for **couples, best friends, siblings, and
long-distance friends** — not just couples. The current site's copy and
vibe descriptions ("a shared blanket," "a corner just for two") are
written couples-only. I'm assuming the Instagram positioning is the real
target market since that's what's actually live and public, and the brief
below builds for that broader audience. Say so if that's wrong and you
want to stay couples-only — it's a quick copy change either way, but it
does touch the data model (see below), so worth confirming before the
agent builds it.

## Packages (from your Google Form — this is real, tested pricing)

| Package | Price | What's included |
|---|---|---|
| Essential Quest | $40 | 5 interactive memory hotspots |
| Animated Story Quest | $65 | 5 hotspots + animated cutscene moments |
| Expanded Quest | $70 | 10 interactive memory hotspots |
| The Ultimate Story | $100 | 10 hotspots + cutscenes + a finale message & closing scene |

**Add-on (any tier):** Look-Alike Pixel Avatars — +$10 — sprites drawn to
actually resemble the two people, not generic characters.

The underlying math already implied by your own form is clean and worth
keeping as the formula (rather than four hardcoded prices): $40 base for 5
hotspots, +$5 per hotspot from 6–10, +$25 for cutscenes, +$5 for a finale
message/scene. That reconciles exactly to your four listed prices, and
means new combinations (say, 10 hotspots + finale, no cutscenes) price
themselves consistently instead of needing a fifth hardcoded tier.

This replaces the currently-coded pricing in `lib/pricing.ts`, which is a
different, smaller, untested model ($45 base + small add-ons) — worth
retiring in favor of the numbers you've actually validated.

## Fonts

Drop `Press Start 2P` as the everything-font — it's the reason body text
and buttons are genuinely hard to read at the sizes they're used at now.
Three-font system instead, all loadable via `next/font/google` (no manual
file downloads needed — this also solves the empty `public/fonts/` problem
for these three, since Next fetches and self-hosts them at build time):

- **Fredoka** (headlines, hero text, package card titles) — bold, rounded,
  playful, and actually legible at large sizes. This is the "Monthly
  Happiness!" energy from kawaiibox, in your palette.
- **Quicksand** (body copy, form labels, buttons) — rounded terminals that
  pair naturally with Fredoka, reads cleanly at small sizes.
- **Press Start 2P** — keep it, but demoted to small accent use only: the
  logo lockup, step numbers ("01", "02"), small tags like "LEVEL UP" — not
  paragraphs or CTAs.

## The prompt for your agent

```
ROLE: continuing the pixxelovee build. This is a visual/content pass, not
a rebuild — the Pixi story viewer, Supabase schema, auth, and admin
dashboard are tested and working; don't touch their internals except
where noted below. Read README.md and the existing components before
changing anything.

Scope of this pass:

1. Fonts — replace the hand-rolled Press Start 2P @font-face in
   globals.css with next/font/google for three fonts: Fredoka (weights
   500/600/700) for headings, Quicksand (400/500/700) for body/UI text,
   and Press Start 2P kept only for small accent use (logo, step
   numbers, small tags). Wire them up as CSS variables in layout.tsx and
   update Tailwind's fontFamily config. Re-check every screen — /,
   /create, /login, /admin, /story/[id] — for text that's now using the
   wrong font in the wrong place.

2. Packages data model — orders currently price themselves through
   lib/pricing.ts's small ad-hoc add-on model. Replace it with:
     - hotspotCount: 5 or 10
     - hasCutscenes: boolean (+$25)
     - hasFinale: boolean (+$5, only meaningful with hotspotCount 10)
     - hasLookAlikeAvatar: boolean add-on (+$10, any combination)
   Base price $40 for 5 hotspots, +$5 per hotspot for hotspots 6–10.
   Add a migration for new columns on `orders` (package_hotspot_count,
   package_has_cutscenes, package_has_finale, has_lookalike_avatar) —
   don't hand-edit the already-run schema.sql. Update src/types/order.ts
   and Step4EstimateSubmit.tsx to show the four named packages (Essential
   Quest / Animated Story Quest / Expanded Quest / The Ultimate Story) as
   selectable cards with their price, rather than a single live-computed
   number — the four packages should be presets that set the underlying
   fields, with the avatar add-on as a separate toggle. Show the admin
   order detail view (OrderDetailView.tsx) which package/add-ons were
   ordered.

3. Broaden the audience — add a "who's it for" selector (Couple / Best
   Friends / Siblings / Long-Distance Friends) to the order builder,
   likely as part of Step 1 alongside vibe selection. Store it as
   relationship_type on orders (new migration column, text, check
   constraint on the four values). This only needs to drive copy for now
   — don't gate any vibe/package combinations by it unless that becomes
   a real requirement later. Update Step1Vibe's copy and the vibe
   descriptions to not read couples-only ("a corner just for two" etc.)
   — keep them warm but make them work for a best-friend or sibling
   story too.

4. Landing page restructure (src/app/page.tsx and src/components/landing/)
   into these sections, in order:
     - Hero: big Fredoka headline, one-line subhead, star-style social
       proof placeholder (hide gracefully until there are real reviews),
       a rounded-pill CTA button with a soft glow (box-shadow, not just
       a border) into /create. Keep HeroPixiDemo but make sure it reads
       as a background/side element, not the main focal point — the
       headline should be what someone sees first.
     - "How it works" — 4 steps: Pick your world & who it's for → We
       hand-draw your pixel story → Review your preview → Get your
       private story link. Match kawaiibox's clean icon + short-caption
       tile pattern.
     - "Packages" — the four tiers as cards (see #2), each with price,
       hotspot count, and what's included, plus the avatar add-on called
       out separately. This replaces any live price-estimator UI on the
       landing page itself (the estimator can stay inside /create).
     - StoryGallery (existing component — keep, just restyle to match
       the new card/section visual language)
     - Trust badges row: e.g. "100% Hand-Drawn Pixel Art", "Private,
       Unlisted Story Link", "3–10 Day Turnaround" — pull real language
       from the README/pricing rather than inventing claims.
     - Testimonials section, structured to take real reviews later
       (name/handle, quote, optional avatar) — empty/placeholder state
       for now, matching the shape of your Instagram's "reviews"
       highlight so real content can drop in later without a rebuild.

5. Visual language: keep the OLED-black base and existing blush-pink
   token, but add a second, more saturated neon-magenta accent (pick
   something in the ballpark of #FF3EA5 — sample the actual pink glow
   used in the Instagram graphics if you can get a reference image) for
   buttons and highlight glows. Buttons go fully rounded (pill-shaped,
   border-radius: 9999px) with a soft box-shadow glow on hover/focus
   instead of the current thin-border style. Keep it dark and
   arcade-flavored — this is a restyle of the existing identity, not a
   switch to kawaiibox's light palette.

6. Verify with tsc --noEmit, and a real next dev smoke test of every
   route. Update README's ✅/⬜ markers. Report back in the same
   Fixed/Added/Not-tested pattern as before.

Do not touch: the Pixi story viewer internals, the auth/middleware flow,
the admin publish logic, or RLS policies — this pass is landing page,
order-builder pricing/copy, and typography only.
```
