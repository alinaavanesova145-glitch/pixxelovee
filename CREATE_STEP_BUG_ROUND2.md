# pixxelovee — `/create` step bug: the guard fix didn't hold, here's proof + a decisive fix

## Short version

I tested the `isTransitioning` guard fix myself, in a real browser, against a
real dev server. It broke on the very first double-click I tried — the
same kind of double-click a normal impatient customer does on a "next"
button. This isn't a "try harder to verify" note — it's proof the
click-guard approach can't fully close this bug, and a recommendation to
stop patching around framer-motion and remove the risky part entirely.

## What I did and what I saw

Selected "Couple" + "Sunset Roof" on step 1, then double-clicked "next"
(a normal OS double-click, not a rapid-fire script). Result, confirmed
three separate ways (screenshot, `get_page_text`, and reading computed
styles directly off the DOM node):

- The step indicator immediately showed **CHARACTER** highlighted (step
  state = 2).
- The content area went **blank** — not stale step-1 content this time,
  just empty-looking.
- Reading the actual DOM node confirmed why: the step-2 content (`"the
  details"` heading, name field, etc.) **was** mounted — but its wrapper
  div was frozen at `opacity: 0.115223` and `transform:
  translateX(14.0261px)`. That's framer-motion's enter animation, stuck
  partway between its `initial` (opacity 0, x 16) and `animate` (opacity
  1, x 0) states. I re-checked those exact numbers 3+ seconds later —
  unchanged. It's not slow, it's dead.
- `next`'s `disabled` was `true` — and stayed `true` forever, since
  whatever's supposed to flip it back (`onExitComplete`) never fired
  (consistent with the animation itself being stuck, not finishing).
- `back` was **not** disabled — so the guard doesn't appear to actually
  cover both buttons the way the report described. Worth a second look at
  the diff.
- Clicking `back` did change the step indicator back to **SETUP**, but
  content stayed on the frozen step-2 DOM node — so now indicator and
  content actively disagreed in the other direction too.
- Only a full page reload recovered it. A real customer in this state
  loses anything they'd typed (names, description) since it's all
  in-memory React state.

So: progress (the right step's markup does get mounted now, unlike
before), but the actual failure mode a customer hits — frozen, unreadable,
unrecoverable without a reload — is just as bad as the original bug, and
it took me one ordinary double-click to hit it.

## Why the guard alone can't fully fix this

The `isTransitioning` flag prevents a *second click* from starting a
*second transition* while one is in flight. It does nothing about the
*first* transition's animation itself failing to complete. What I
captured (a tween permanently frozen at a partial opacity/transform,
never reaching its end state, `onExitComplete` never firing) is a stuck
*animation frame loop*, not a re-entrancy problem — no amount of
click-debouncing prevents an animation that hangs once it's already
started. This matches the framer-motion `AnimatePresence` issue class
from before (stuck exit/enter cycles), just triggering through a
slightly different path than round 1.

## The fix — this time, remove the risk instead of guarding it

Stop relying on `AnimatePresence`'s coordinated exit-then-enter cycle for
this wizard. It's the thing that can hang, and this is a checkout funnel
— correctness matters more than a fade transition here.

In `src/app/create/page.tsx`:

1. Remove the `<AnimatePresence mode="wait">` wrapper around the step
   content entirely.
2. Keep `<motion.div key={step}>` (or just a plain `<div key={step}>`) for
   the remount-on-step-change behavior, but give it only `initial` and
   `animate` props — **no `exit` prop, no `AnimatePresence`**. A
   mount-only fade-in (opacity/x animating in on entry) has nothing to
   wait on and nothing to get stuck exiting from; the old step's DOM node
   is simply replaced on the next render, immediately.
3. You can keep the `isTransitioning` guard from this pass if you want —
   it's not wrong, just insufficient alone — but it's no longer load-
   bearing for correctness once there's no exit animation to race
   against. Your call whether it's still worth the complexity.
4. If you want to keep a nicer cross-fade look, that's fine as a separate
   follow-up — but implement it with the outgoing element's exit handled
   by a plain CSS transition on unmount-visibility rather than
   framer-motion's imperative exit lifecycle, or accept a slightly less
   fancy instant swap. Don't reach for `AnimatePresence` again here
   without a way to guarantee it can't hang.

## Verification (this is what caught it — don't skip it)

1. Click through all 4 steps normally once.
2. On each step boundary, do a real **double-click** (not two scripted
   clicks with a deliberate gap — an actual double-click, both directions
   where applicable) on next and on back. After each one, check three
   things, not just page text: the step indicator, the back-button
   visibility, AND the content wrapper's computed `opacity`/`transform`
   settle to `1` / `none` (or your final animate values) within ~1
   second. A frozen partial value is a fail even if the right text is
   technically in the DOM.
3. Repeat at least 5x per boundary, both directions.
4. Confirm recovery behavior: if you can still reproduce any stuck state,
   note whether reload is the only recovery (it was, for me).
5. Once this is solid, re-run the real order submission end to end —
   the `orders` RLS policy gap is already fixed on the database side, so
   this should be the thing standing between you and a working checkout
   funnel.

Report back Fixed/Added/Not-tested as before, and this time include the
double-click result explicitly — that's the test that matters most.

## Do not touch

Same as last time: step components, `lib/pricing.ts`, `handleSubmit`'s
Supabase logic. This is scoped to how `page.tsx` mounts/animates step
content.
