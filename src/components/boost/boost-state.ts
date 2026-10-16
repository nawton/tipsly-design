import { market } from "@/lib/data";
import type { Bid } from "@/lib/types";

export type BoostPhase = "idle" | "leading" | "outbid";

/** The owner's view of next week's auction in their market. */
export type BoostState = {
  phase: BoostPhase;
  /** The owner's latest bid, or null before the first one. */
  myBid: number | null;
  /** The highest bid right now. */
  leading: number;
  /** All active bids, highest first. */
  bids: Bid[];
  /** Who outbid the owner, when phase is "outbid". */
  outbidBy: string;
};

export function initialBoostState(city: string, cat: string): BoostState {
  const m = market(city, cat);
  return { phase: "idle", myBid: null, leading: m.leading, bids: m.bids, outbidBy: "" };
}

export const sortBids = (list: Bid[]) => list.slice().sort((a, b) => b.amount - a.amount);
