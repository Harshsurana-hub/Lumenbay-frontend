import type { OnChainStatus } from "@/lib/stellar/chain";

/**
 * How the database's escrow state follows the chain.
 *
 * Pure so it can be tested without a database. The database adds detail the
 * chain doesn't have (shipped), so a Funded escrow keeps whichever of
 * funded / in_escrow / in_transit it is already in.
 */

export type DbEscrowState = "funded" | "in_escrow" | "in_transit" | "released" | "disputed" | "refunded" | "cancelled";
export type DbOrderStatus = "pending" | "paid" | "fulfilled" | "cancelled" | "refunded";

const HOLDING: DbEscrowState[] = ["funded", "in_escrow", "in_transit"];

/**
 * The states to step through, in order, to bring `current` in line with the
 * chain. Each step is a transition the database trigger allows. Empty when
 * nothing needs to change, or the chain is somewhere we never record.
 */
export function stepsToMatchChain(current: DbEscrowState, chain: OnChainStatus): DbEscrowState[] {
  switch (chain) {
    case "Funded":
      // A dispute resolved without moving money puts it back in escrow.
      return current === "disputed" ? ["in_escrow"] : [];
    case "Released":
      return current === "released" || !canStillMove(current) ? [] : ["released"];
    case "Disputed":
      return HOLDING.includes(current) ? ["disputed"] : [];
    case "Refunded":
      if (current === "disputed") return ["refunded"];
      // Both the dispute and its refund happened between two syncs.
      return HOLDING.includes(current) ? ["disputed", "refunded"] : [];
    default:
      return [];
  }
}

function canStillMove(state: DbEscrowState) {
  return HOLDING.includes(state) || state === "disputed";
}

export function orderStatusFor(state: DbEscrowState): DbOrderStatus {
  if (state === "released") return "fulfilled";
  if (state === "refunded") return "refunded";
  if (state === "cancelled") return "cancelled";
  return "paid";
}

/** Exact XLM decimal string (as Postgres returns numeric) to stroops, without float rounding. */
export function decimalXlmToStroops(value: string | number): bigint {
  const text = typeof value === "number" ? value.toFixed(7) : value.trim();
  const match = text.match(/^(\d+)(?:\.(\d{0,7})\d*)?$/);
  if (!match) throw new Error(`Not an XLM amount: ${value}`);
  const [, whole, fraction = ""] = match;
  return BigInt(whole) * BigInt(10_000_000) + BigInt(fraction.padEnd(7, "0") || "0");
}
