/**
 * Append-only record of every money-moving step the browser attempts.
 *
 * Each entry says what was tried, by which wallet, for how much, and what came
 * back (a transaction hash on success, the raw error and contract code on
 * failure). It is kept locally so a buyer's own history survives reloads, and
 * is the shape the server-side audit table will store.
 */

export type PaymentStep =
  | "checkout_started"
  | "escrow_created"
  | "escrow_funded"
  | "escrow_released"
  | "dispute_opened"
  | "step_failed";

export interface PaymentEvent {
  id: string;
  at: string;
  step: PaymentStep;
  /** Which action failed, for `step_failed`. */
  failedAction?: "create" | "fund" | "release" | "dispute";
  escrowId?: string;
  productId?: string;
  buyer?: string;
  seller?: string;
  amountXlm?: number;
  txHash?: string;
  errorCode?: number;
  errorMessage?: string;
  network: string;
  contractId: string;
}

const KEY = "lumenbay-payment-journal";
const CHANGE_EVENT = "lumenbay-payment-journal-change";
const MAX_EVENTS = 500;

export function parseJournal(raw: string | null): PaymentEvent[] {
  try {
    return JSON.parse(raw || "[]") as PaymentEvent[];
  } catch {
    return [];
  }
}

function read(): PaymentEvent[] {
  try {
    return parseJournal(localStorage.getItem(KEY));
  } catch {
    return [];
  }
}

/** For useSyncExternalStore: the raw journal string, stable until it changes. */
export function journalSnapshot(): string {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
}

/** Notifies on changes from this tab and from other tabs. */
export function subscribeJournal(onChange: () => void): () => void {
  window.addEventListener("storage", onChange);
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(CHANGE_EVENT, onChange);
  };
}

export function recordPaymentEvent(event: Omit<PaymentEvent, "id" | "at">): PaymentEvent {
  const full: PaymentEvent = { id: crypto.randomUUID(), at: new Date().toISOString(), ...event };
  try {
    const events = read();
    events.push(full);
    localStorage.setItem(KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage can be unavailable (private mode). The console line below still records it.
  }
  const log = event.step === "step_failed" ? console.error : console.info;
  log("[lumenbay:payment]", full);
  return full;
}

/** All recorded events for one escrow, oldest first. */
export function eventsForEscrow(escrowId: string): PaymentEvent[] {
  return read().filter((e) => e.escrowId === escrowId);
}

/** Latest recorded event per escrow involving this wallet, newest first. */
export function escrowsForWallet(address: string, events: PaymentEvent[] = read()): PaymentEvent[] {
  const latest = new Map<string, PaymentEvent>();
  for (const e of events) {
    if (!e.escrowId || (e.buyer !== address && e.seller !== address)) continue;
    latest.set(e.escrowId, e);
  }
  return [...latest.values()].sort((a, b) => b.at.localeCompare(a.at));
}

/** Escrows this browser created but never managed to fund, newest first. */
export function unfundedEscrows(buyer: string, events: PaymentEvent[] = read()): PaymentEvent[] {
  const funded = new Set(events.filter((e) => e.step === "escrow_funded").map((e) => e.escrowId));
  return events
    .filter((e) => e.step === "escrow_created" && e.buyer === buyer && !funded.has(e.escrowId))
    .reverse();
}
