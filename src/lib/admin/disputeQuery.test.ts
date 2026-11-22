import { describe, expect, it } from "vitest";
import {
  DEFAULT_QUERY,
  ageTone,
  matchesSearch,
  parseDisputeQuery,
  queryRows,
  sortRows,
  summarize,
  toSearchParams,
  type DisputeRow,
} from "./disputeQuery";

const now = new Date("2026-11-22T12:00:00Z");
const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

function row(i: number, over: Partial<DisputeRow> = {}): DisputeRow {
  return {
    chainEscrowId: String(i),
    status: "open",
    recorded: true,
    productName: `Item ${i}`,
    image: null,
    buyerName: `Buyer ${i}`,
    sellerName: `Seller ${i}`,
    amountStroops: String(i * 10_000_000),
    reason: "ProductNotReceived",
    openedAt: daysAgo(i),
    shippedAt: null,
    outcome: null,
    resolvedAt: null,
    adminName: null,
    note: null,
    txHash: null,
    ...over,
  };
}

describe("parseDisputeQuery / toSearchParams", () => {
  it("defaults anything missing or invalid", () => {
    expect(parseDisputeQuery(new URLSearchParams("tab=nope&sort=x&page=-3&min=abc&reason=Bogus"))).toEqual(DEFAULT_QUERY);
  });
  it("round-trips a full query and omits defaults from the URL", () => {
    const q = parseDisputeQuery(new URLSearchParams("tab=resolved&q=lamp&reason=WrongProduct&min=5&max=100&sort=amount&page=3"));
    expect(q).toEqual({ tab: "resolved", q: "lamp", reason: "WrongProduct", min: 5, max: 100, sort: "amount", page: 3 });
    expect(parseDisputeQuery(toSearchParams(q))).toEqual(q);
    expect(toSearchParams(DEFAULT_QUERY).toString()).toBe("");
  });
});

describe("matchesSearch", () => {
  const r = row(12, { productName: "Vintage Camera", buyerName: "Amara", sellerName: "Bayo" });
  it("matches item, buyer and seller, case-insensitively", () => {
    expect(matchesSearch(r, "camera")).toBe(true);
    expect(matchesSearch(r, "AMARA")).toBe(true);
    expect(matchesSearch(r, "bayo")).toBe(true);
    expect(matchesSearch(r, "lamp")).toBe(false);
  });
  it("matches the escrow number exactly, with or without #", () => {
    expect(matchesSearch(r, "#12")).toBe(true);
    expect(matchesSearch(r, "12")).toBe(true);
    expect(matchesSearch(r, "#1")).toBe(false);
  });
});

describe("sortRows", () => {
  const rows = [row(1), row(9), row(4)];
  it("puts the oldest dispute first by default", () => {
    expect(sortRows(rows, "oldest").map((r) => r.chainEscrowId)).toEqual(["9", "4", "1"]);
  });
  it("puts the biggest amount first when asked", () => {
    expect(sortRows([row(1), row(9), row(4)], "amount").map((r) => r.chainEscrowId)).toEqual(["9", "4", "1"]);
    expect(sortRows([row(2, { amountStroops: "500" }), row(3, { amountStroops: "900" })], "amount")[0].chainEscrowId).toBe("3");
  });
  it("treats an unknown open date as oldest", () => {
    expect(sortRows([row(1), row(2, { openedAt: null })], "oldest")[0].chainEscrowId).toBe("2");
  });
});

describe("queryRows", () => {
  const all = [
    ...Array.from({ length: 60 }, (_, i) => row(i + 1, { reason: i % 2 ? "WrongProduct" : "ProductNotReceived" })),
    row(100, { status: "refunded", outcome: "refund", resolvedAt: daysAgo(1) }),
    row(101, { status: "needs_note", outcome: "release" }),
  ];

  it("counts tabs before search and filters; needs-note rulings stay in Open", () => {
    expect(queryRows(all, { ...DEFAULT_QUERY, q: "zzz" }).counts).toEqual({ open: 61, resolved: 1, all: 62 });
  });
  it("pages 25 at a time and clamps a page past the end", () => {
    const p1 = queryRows(all, DEFAULT_QUERY);
    expect(p1.rows).toHaveLength(25);
    expect(p1.pageCount).toBe(3);
    const last = queryRows(all, { ...DEFAULT_QUERY, page: 99 });
    expect(last.page).toBe(3);
    expect(last.rows).toHaveLength(11);
  });
  it("filters by reason and by an inclusive amount range in XLM", () => {
    const byReason = queryRows(all, { ...DEFAULT_QUERY, reason: "WrongProduct" });
    expect(byReason.total).toBe(30);
    const byAmount = queryRows(all, { ...DEFAULT_QUERY, min: 10, max: 12 });
    expect(byAmount.rows.map((r) => r.chainEscrowId).sort()).toEqual(["10", "11", "12"]);
  });
  it("shows only resolved rows on the Resolved tab", () => {
    expect(queryRows(all, { ...DEFAULT_QUERY, tab: "resolved" }).rows.map((r) => r.chainEscrowId)).toEqual(["100"]);
  });
});

describe("ageTone", () => {
  it("is amber after 2 days and red after 5", () => {
    expect(ageTone(daysAgo(1), now)).toBe("normal");
    expect(ageTone(daysAgo(2.5), now)).toBe("amber");
    expect(ageTone(daysAgo(5.5), now)).toBe("red");
    expect(ageTone(null, now)).toBe("normal");
  });
});

describe("summarize", () => {
  it("sums only money still locked, finds the oldest open, counts this week's rulings", () => {
    const s = summarize(
      [
        row(3, { amountStroops: "30000000" }),
        row(8, { amountStroops: "70000000" }),
        row(20, { status: "needs_note", amountStroops: "990000000" }),
        row(30, { status: "released", resolvedAt: daysAgo(2) }),
        row(31, { status: "refunded", resolvedAt: daysAgo(10) }),
      ],
      now,
    );
    expect(s.openCount).toBe(3);
    expect(s.lockedStroops).toBe("100000000");
    expect(s.oldestOpenAt).toBe(daysAgo(20));
    expect(s.resolvedThisWeek).toBe(1);
  });
});
