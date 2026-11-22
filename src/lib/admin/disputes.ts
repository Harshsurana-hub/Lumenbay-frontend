import type { OnChainStatus } from "@/lib/stellar/chain";

/**
 * Dispute resolution rules, kept pure so they can be tested without a chain
 * or a database.
 *
 * What the contract supports (Lumenbay-contract `main`, lifecycle.rs):
 *   resolve_dispute(escrow_id, resolution)  0 = release to seller, 1 = refund buyer
 *   - signed by the contract admin (or the escrow's arbiter, if it has one);
 *   - all or nothing: there is no admin split. A split exists only when both
 *     parties agree on the same amount during a mediation window;
 *   - blocked (#166) while a mediation window is open; the admin can close it
 *     with cancel_mediation(admin, escrow_id);
 *   - sets the status at once, but the money only moves after an appeal
 *     window of APPEAL_WINDOW_LEDGERS, via claim_disputed_funds(escrow_id),
 *     which anyone may call.
 */

export type DisputeOutcome = "refund" | "release";

/** ~24 h at 5 s per ledger. Mirrors APPEAL_WINDOW_LEDGERS in the contract. */
export const APPEAL_WINDOW_LEDGERS = 17_280;
export const SECONDS_PER_LEDGER = 5;
export const NOTE_MIN = 5;
export const NOTE_MAX = 2000;

export function resolutionCode(outcome: DisputeOutcome): 0 | 1 {
  return outcome === "release" ? 0 : 1;
}

/** The outcome a resolved escrow's on-chain status records, or null if it isn't resolved. */
export function outcomeFromChain(status: OnChainStatus): DisputeOutcome | null {
  if (status === "Refunded") return "refund";
  if (status === "Released") return "release";
  return null;
}

export function isDisputeOutcome(value: unknown): value is DisputeOutcome {
  return value === "refund" || value === "release";
}

/** Null when valid, otherwise what's wrong in plain words. */
export function noteProblem(note: unknown): string | null {
  if (typeof note !== "string") return "Add an internal note explaining the decision.";
  const length = note.trim().length;
  if (length < NOTE_MIN) return `The internal note needs at least ${NOTE_MIN} characters.`;
  if (length > NOTE_MAX) return `Keep the internal note under ${NOTE_MAX} characters.`;
  return null;
}

export interface Payout {
  /** Stroops to the buyer. */
  buyer: bigint;
  /** Stroops to the seller, after the platform fee. */
  seller: bigint;
  /** Platform fee in stroops. */
  fee: bigint;
}

/**
 * Who gets what. A refund returns everything to the buyer with no fee; a
 * release pays the seller minus the platform fee. The contract may apply
 * fee caps or volume discounts, so the release figure is an estimate.
 */
export function payoutFor(outcome: DisputeOutcome, amount: bigint, feeBps: number): Payout {
  if (outcome === "refund") return { buyer: amount, seller: BigInt(0), fee: BigInt(0) };
  const fee = (amount * BigInt(Math.max(0, Math.round(feeBps)))) / BigInt(10_000);
  return { buyer: BigInt(0), seller: amount - fee, fee };
}

export type PayoutState =
  | { kind: "none" }
  | { kind: "waiting"; ledgersLeft: number; secondsLeft: number }
  | { kind: "claimable" }
  | { kind: "paid" };

/**
 * Where the money of a resolved dispute is. `claimableAt` is the contract's
 * ClaimableAt entry: present between the ruling and the payout, removed by
 * the payout. Claimable strictly after that ledger.
 */
export function payoutState(args: { resolved: boolean; claimableAt: number | null; currentLedger: number }): PayoutState {
  if (!args.resolved) return { kind: "none" };
  if (args.claimableAt === null) return { kind: "paid" };
  if (args.currentLedger > args.claimableAt) return { kind: "claimable" };
  const ledgersLeft = args.claimableAt - args.currentLedger + 1;
  return { kind: "waiting", ledgersLeft, secondsLeft: ledgersLeft * SECONDS_PER_LEDGER };
}

export interface MediationInfo {
  expiresAt: number;
  concluded: boolean;
}

/** True when an open mediation window would make resolve_dispute fail with #166. */
export function mediationBlocks(mediation: MediationInfo | null, currentLedger: number): boolean {
  return !!mediation && !mediation.concluded && currentLedger <= mediation.expiresAt;
}

/** "3 days", "5 hours", "12 minutes": how long something has been going, roughly. */
export function durationLabel(fromIso: string, now: Date = new Date()): string {
  const ms = Math.max(0, now.getTime() - new Date(fromIso).getTime());
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  return `${days} days`;
}

/** "about 23 hours" for a countdown in seconds. */
export function countdownLabel(seconds: number): string {
  if (seconds < 90) return "about a minute";
  const minutes = Math.round(seconds / 60);
  if (minutes < 90) return `about ${minutes} minutes`;
  return `about ${Math.round(minutes / 60)} hours`;
}

export const REASON_LABEL: Record<string, string> = {
  ProductNotReceived: "Item never arrived",
  ProductDefective: "Item is damaged or defective",
  WrongProduct: "Wrong item received",
  ChangedMind: "Changed their mind",
  Other: "Something else",
};

export interface TimelineEntry {
  at: string;
  title: string;
  detail?: string | null;
  actor: string;
  txHash?: string | null;
  tone: "ok" | "bad" | "warn" | "muted";
}

const PAYMENT_STEP_TITLE: Record<string, string> = {
  checkout_started: "Checkout started",
  escrow_created: "Escrow created on-chain",
  escrow_funded: "Payment locked",
  escrow_released: "Released by buyer",
  dispute_opened: "Dispute opened",
  order_shipped: "Marked as shipped",
  dispute_resolved: "Dispute resolved",
  funds_claimed: "Funds paid out",
  step_failed: "A step failed",
};

/**
 * One timeline from the escrow's state changes (escrow_events) and the
 * payment steps both sides attempted (payment_events), oldest first.
 */
export function buildTimeline(
  escrowEvents: { state: string; label: string; actor: string; description: string | null; created_at: string }[],
  paymentEvents: { step: string; failed_action: string | null; tx_hash: string | null; error_message: string | null; created_at: string; client_at: string | null; actor: string }[],
): TimelineEntry[] {
  const entries: TimelineEntry[] = [
    ...escrowEvents.map((e) => ({
      at: e.created_at,
      title: e.label,
      detail: e.description,
      actor: e.actor,
      tone: (e.state === "disputed" ? "bad" : e.state === "released" || e.state === "refunded" ? "ok" : "muted") as TimelineEntry["tone"],
    })),
    ...paymentEvents.map((p) => ({
      at: p.client_at ?? p.created_at,
      title: `${PAYMENT_STEP_TITLE[p.step] ?? p.step}${p.failed_action ? ` (${p.failed_action})` : ""}`,
      detail: p.error_message,
      actor: p.actor,
      txHash: p.tx_hash,
      tone: (p.step === "step_failed" ? "warn" : p.step === "dispute_opened" ? "bad" : "muted") as TimelineEntry["tone"],
    })),
  ];
  return sortTimeline(entries);
}

/** Oldest first. By parsed time: the database and the chain format timestamps differently. */
export function sortTimeline(entries: TimelineEntry[]): TimelineEntry[] {
  return entries.sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

/**
 * Whether a decoded transaction is the expected call on the expected escrow.
 * Every dispute call takes the escrow id as its first argument.
 */
export function invocationMatches(
  inv: { contractId: string; fn: string; args: unknown[] } | null,
  expected: { contractId: string; fn: string; escrowId: bigint; resolution?: number },
): boolean {
  if (!inv || inv.contractId !== expected.contractId || inv.fn !== expected.fn) return false;
  const [id, second] = inv.args;
  if (typeof id !== "bigint" && typeof id !== "number") return false;
  if (BigInt(id) !== expected.escrowId) return false;
  if (expected.resolution !== undefined && Number(second) !== expected.resolution) return false;
  return true;
}

/** Hex SHA-256 of a note, the way the order page fingerprints a dispute note on-chain. */
export async function noteFingerprint(note: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(note));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
