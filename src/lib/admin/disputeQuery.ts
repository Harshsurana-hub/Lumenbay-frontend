import type { DisputeOutcome } from "./disputes";

/**
 * The disputes queue: one row shape for open and resolved disputes, and the
 * search / filter / sort / page rules applied on the server. Pure, so it is
 * tested without a chain or a database, and so the URL query and the server
 * agree on exactly one meaning of each parameter.
 */

export type DisputeTab = "open" | "resolved" | "all";
export type DisputeSort = "oldest" | "amount";
export type RowStatus = "open" | "needs_note" | "refunded" | "released";

export const PAGE_SIZE = 25;
export const REASONS = ["ProductNotReceived", "ProductDefective", "WrongProduct", "ChangedMind", "Other"] as const;

export interface DisputeRow {
  chainEscrowId: string;
  status: RowStatus;
  recorded: boolean;
  productName: string;
  image: string | null;
  buyerName: string;
  sellerName: string;
  amountStroops: string;
  reason: string | null;
  /** When the dispute was opened. */
  openedAt: string | null;
  shippedAt: string | null;
  // Resolved rows only.
  outcome: DisputeOutcome | null;
  resolvedAt: string | null;
  adminName: string | null;
  note: string | null;
  txHash: string | null;
}

export interface DisputeQuery {
  tab: DisputeTab;
  q: string;
  reason: string | null;
  /** XLM, inclusive. */
  min: number | null;
  max: number | null;
  sort: DisputeSort;
  /** 1-based. */
  page: number;
}

export const DEFAULT_QUERY: DisputeQuery = { tab: "open", q: "", reason: null, min: null, max: null, sort: "oldest", page: 1 };

type ParamSource = { get(name: string): string | null };

function num(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

/** Reads a query from URL search params, falling back to defaults for anything missing or invalid. */
export function parseDisputeQuery(params: ParamSource): DisputeQuery {
  const tab = params.get("tab");
  const sort = params.get("sort");
  const reason = params.get("reason");
  const page = Math.floor(num(params.get("page")) ?? 1);
  return {
    tab: tab === "resolved" || tab === "all" ? tab : "open",
    q: (params.get("q") ?? "").trim().slice(0, 100),
    reason: reason && (REASONS as readonly string[]).includes(reason) ? reason : null,
    min: num(params.get("min")),
    max: num(params.get("max")),
    sort: sort === "amount" ? "amount" : "oldest",
    page: page >= 1 ? page : 1,
  };
}

/** The query as URL params, leaving out defaults so links stay short. */
export function toSearchParams(query: Partial<DisputeQuery>): URLSearchParams {
  const q = { ...DEFAULT_QUERY, ...query };
  const out = new URLSearchParams();
  if (q.tab !== "open") out.set("tab", q.tab);
  if (q.q) out.set("q", q.q);
  if (q.reason) out.set("reason", q.reason);
  if (q.min !== null) out.set("min", String(q.min));
  if (q.max !== null) out.set("max", String(q.max));
  if (q.sort !== "oldest") out.set("sort", q.sort);
  if (q.page > 1) out.set("page", String(q.page));
  return out;
}

export function inTab(row: DisputeRow, tab: DisputeTab): boolean {
  if (tab === "all") return true;
  const open = row.status === "open" || row.status === "needs_note";
  return tab === "open" ? open : !open;
}

/** Item, buyer, seller, or escrow number ("#12" or "12"). Case-insensitive. */
export function matchesSearch(row: DisputeRow, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const id = needle.replace(/^#/, "");
  if (/^\d+$/.test(id) && row.chainEscrowId === id) return true;
  return [row.productName, row.buyerName, row.sellerName].some((v) => v.toLowerCase().includes(needle));
}

const STROOPS = 10_000_000;

export function matchesFilters(row: DisputeRow, query: Pick<DisputeQuery, "reason" | "min" | "max">): boolean {
  if (query.reason && row.reason !== query.reason) return false;
  const xlm = Number(row.amountStroops) / STROOPS;
  if (query.min !== null && xlm < query.min) return false;
  if (query.max !== null && xlm > query.max) return false;
  return true;
}

function ageKey(row: DisputeRow): number {
  // Unknown open date sorts as oldest: it most likely predates our records.
  return row.openedAt ? Date.parse(row.openedAt) : Number.NEGATIVE_INFINITY;
}

export function sortRows(rows: DisputeRow[], sort: DisputeSort): DisputeRow[] {
  return [...rows].sort((a, b) => {
    if (sort === "amount") {
      const diff = BigInt(b.amountStroops) - BigInt(a.amountStroops);
      if (diff !== BigInt(0)) return diff > BigInt(0) ? 1 : -1;
    }
    const age = ageKey(a) - ageKey(b);
    if (age !== 0 && !Number.isNaN(age)) return age;
    return Number(a.chainEscrowId) - Number(b.chainEscrowId);
  });
}

export interface DisputePage {
  rows: DisputeRow[];
  /** Matching rows across all pages. */
  total: number;
  page: number;
  pageCount: number;
  /** Rows per tab before search and filters, for the tab badges. */
  counts: Record<DisputeTab, number>;
}

/** Tab, search, filters, sort, then one page. Out-of-range pages clamp to the last. */
export function queryRows(all: DisputeRow[], query: DisputeQuery, pageSize = PAGE_SIZE): DisputePage {
  const counts = {
    open: all.filter((r) => inTab(r, "open")).length,
    resolved: all.filter((r) => inTab(r, "resolved")).length,
    all: all.length,
  };
  const matching = sortRows(
    all.filter((r) => inTab(r, query.tab) && matchesSearch(r, query.q) && matchesFilters(r, query)),
    query.sort,
  );
  const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
  const page = Math.min(query.page, pageCount);
  return { rows: matching.slice((page - 1) * pageSize, page * pageSize), total: matching.length, page, pageCount, counts };
}

export type AgeTone = "normal" | "amber" | "red";

/** How urgent an open dispute's age is: amber after 2 days, red after 5. */
export function ageTone(openedAt: string | null, now: Date = new Date()): AgeTone {
  if (!openedAt) return "normal";
  const days = (now.getTime() - Date.parse(openedAt)) / 86_400_000;
  if (days > 5) return "red";
  if (days > 2) return "amber";
  return "normal";
}

export interface QueueSummary {
  openCount: number;
  lockedStroops: string;
  oldestOpenAt: string | null;
  resolvedThisWeek: number;
}

/** The strip above the queue: computed over every row, not just the current page. */
export function summarize(all: DisputeRow[], now: Date = new Date()): QueueSummary {
  const open = all.filter((r) => inTab(r, "open"));
  const weekAgo = now.getTime() - 7 * 86_400_000;
  return {
    openCount: open.length,
    // Rows that still hold money: open disputes, not rulings waiting for a note.
    lockedStroops: open.filter((r) => r.status === "open").reduce((sum, r) => sum + BigInt(r.amountStroops), BigInt(0)).toString(),
    oldestOpenAt: open.reduce<string | null>((min, r) => (r.openedAt && (!min || Date.parse(r.openedAt) < Date.parse(min)) ? r.openedAt : min), null),
    resolvedThisWeek: all.filter((r) => !inTab(r, "open") && r.resolvedAt && Date.parse(r.resolvedAt) >= weekAgo).length,
  };
}
