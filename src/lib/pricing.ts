import type { OrderDraft } from '@/types/order';

export interface PriceEstimate {
  price: number;
  timeline: string;
}

const BASE_PRICE = 45;
const CUSTOM_MUSIC_ADDON = 10;
const EASTER_EGG_ADDON = 5;
const FREE_EASTER_EGGS = 1;
const TEXT_PROMPT_ADDON = 5;
const FREE_TEXT_PROMPTS = 1;

export function estimate(draft: OrderDraft): PriceEstimate {
  let price = BASE_PRICE;

  if (draft.musicChoice === 'custom' && draft.musicAssetPath) price += CUSTOM_MUSIC_ADDON;

  const extraEggs = Math.max(0, draft.easterEggs.length - FREE_EASTER_EGGS);
  price += extraEggs * EASTER_EGG_ADDON;

  const extraPrompts = Math.max(0, draft.textPrompts.length - FREE_TEXT_PROMPTS);
  price += extraPrompts * TEXT_PROMPT_ADDON;

  const complexity = draft.easterEggs.length + draft.textPrompts.length;
  const timeline = complexity <= 2 ? '3–5 days' : complexity <= 5 ? '5–7 days' : '7–10 days';

  return { price, timeline };
}
