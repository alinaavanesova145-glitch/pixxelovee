# pixxelovee — real bug found: `/create` steps get stuck mid-transition

## Correcting what I told you earlier

I originally guessed this was stale dev-server state from all the redesign
edits. That guess was wrong — I re-tested with a genuinely fresh dev server,
a clean browser tab, real clicks, and confirmed via both a screenshot *and*
a direct read of the page's actual text (not just visual inspection) that
this is a real, reproducible bug in the app itself. Sorry for the false
lead — wanted to be clear about what changed since I said "stale HMR."

## What's actually happening

In `/create`, clicking **next** or **back** sometimes updates the step
indicator (SETUP / CHARACTER / MUSIC & MAGIC / PACKAGE) and the back-button
visibility, but the actual form content underneath stays frozen on the
*previous* step. I reproduced it going both forward (next) and backward
(back). It's intermittent — sometimes a transition works fine, sometimes it
sticks — which is the signature of a race condition, not a logic bug in
your code's step numbers.

## Root cause

`src/app/create/page.tsx` renders the step content like this:

```tsx
<AnimatePresence mode="wait">
  <motion.div key={step} ...>
    {step === 1 && <Step1Vibe .../>}
    {step === 2 && <Step2Character .../>}
    {step === 3 && <Step3MusicElements .../>}
    {step === 4 && <Step4EstimateSubmit .../>}
  </motion.div>
</AnimatePresence>
```

...while the step indicator `<ol>` and the back/next buttons live *outside*
this block and read `step` directly. That's why the indicator/back-button
always update correctly and instantly (they're plain React, no animation
gating) while the content can get stuck (it's gated behind framer-motion's
exit/enter cycle).

This is a known class of bug in framer-motion's `AnimatePresence` —
`mode="wait"` can get permanently stuck if a key change happens while it's
still mid-exit, or in some cases just from fast consecutive state changes.
It's been reported multiple times against the library itself, e.g.:
- https://github.com/motiondivision/motion/issues/2554 ("AnimatePresence gets stuck when state changes quickly")
- https://github.com/motiondivision/motion/issues/2023
- https://github.com/motiondivision/motion/issues/380

Your installed version is `framer-motion@11.18.2` on `react@19.2.8`
(current published version is `13.2.0`, now under the package name
`motion`) — a two-major-version gap, and these stuck-AnimatePresence
reports recur across many versions, so an upgrade alone isn't guaranteed to
fix it.

This matters beyond visual polish: a customer who hits this on step 1→2 or
3→4 is stuck and can't reach the submit button at all. It's a plausible
contributor to (or at least sits directly in the failure path of) the
"Something went wrong. Try again?" error from the original test — worth
re-testing once this is fixed.

## The fix

Two parts. Part 1 is required and should fully close the bug on its own —
it doesn't depend on framer-motion fixing anything. Part 2 is optional
extra safety.

**1. Guard against re-entrant transitions (required).** Add a
`isTransitioning` boolean state to `CreatePage`. Set it `true` the moment
`next`/`back` is clicked, disable both buttons while it's `true` (same
pattern already used for `disabled={!canAdvance}`), and clear it back to
`false` in `AnimatePresence`'s `onExitComplete` callback (fires once the
exit animation for the outgoing step has actually finished). This closes
the exact race window — a second click can no longer land while
framer-motion is still mid-transition, which is what the stuck state
requires to happen.

**2. Optional: try upgrading framer-motion** to the latest `motion`
package (`npm install motion` — it's the same library, renamed; check
their migration notes for the import path change from `framer-motion` to
`motion/react`) and re-test. Don't treat this as the fix on its own — verify
part 1 fixes it *before* touching the dependency, then decide separately
whether the upgrade is worth doing.

## Verification (this is the part that matters most)

The bug is intermittent, so a single clean click-through will not prove
it's fixed. In a real (visible, not headless) browser:

1. Click through all 4 steps normally once, confirm each step's content
   matches its indicator label.
2. Click "next" **twice in quick succession** (double-click speed) on each
   step, and separately try rapid next→back→next sequences. After each
   burst, confirm the indicator, the back-button visibility, AND the
   rendered content all agree on the same step.
3. Repeat step 2 at least 5 times per step transition — intermittent bugs
   need repetition to trust a "fixed" verdict.
4. Once through, do one full real order submission (real-ish data is fine)
   end to end and confirm it actually reaches the success screen — this is
   the re-test of the original submit error.

Report back the same Fixed/Added/Not-tested way as before, and explicitly
say how many times you repeated the rapid-click test and whether it ever
stuck.

## Do not touch

Nothing else in `/create` needs to change — not the step components, not
`lib/pricing.ts`, not the Supabase insert logic in `handleSubmit`. This is
scoped to the transition-guard state in `page.tsx` (and, if you attempt
part 2, the framer-motion/motion dependency bump only).
