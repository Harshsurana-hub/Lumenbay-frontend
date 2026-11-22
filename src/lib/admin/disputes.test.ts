import { describe, expect, it } from "vitest";
import {
  buildTimeline,
  countdownLabel,
  durationLabel,
  invocationMatches,
  isDisputeOutcome,
  mediationBlocks,
  noteFingerprint,
  noteProblem,
  outcomeFromChain,
  payoutFor,
  payoutState,
  resolutionCode,
} from "./disputes";

const b = (n: number) => BigInt(n);
const XLM = b(10_000_000);

describe("resolutionCode", () => {
  it("matches the contract: 0 releases to the seller, 1 refunds the buyer", () => {
    expect(resolutionCode("release")).toBe(0);
    expect(resolutionCode("refund")).toBe(1);
  });
});

describe("outcomeFromChain", () => {
  it("reads the outcome from a resolved status", () => {
    expect(outcomeFromChain("Refunded")).toBe("refund");
    expect(outcomeFromChain("Released")).toBe("release");
  });
  it("is null while still disputed or for any other status", () => {
    expect(outcomeFromChain("Disputed")).toBeNull();
    expect(outcomeFromChain("Funded")).toBeNull();
    expect(outcomeFromChain("Cancelled")).toBeNull();
  });
});

describe("isDisputeOutcome", () => {
  it("accepts only the two outcomes the contract supports", () => {
    expect(isDisputeOutcome("refund")).toBe(true);
    expect(isDisputeOutcome("release")).toBe(true);
    expect(isDisputeOutcome("split")).toBe(false);
    expect(isDisputeOutcome(undefined)).toBe(false);
  });
});

describe("noteProblem", () => {
  it("requires a real note", () => {
    expect(noteProblem(undefined)).toMatch(/internal note/);
    expect(noteProblem("   ok ")).toMatch(/at least 5/);
    expect(noteProblem("x".repeat(2001))).toMatch(/under 2000/);
  });
  it("accepts a normal note, ignoring surrounding spaces", () => {
    expect(noteProblem("  Seller showed tracking; delivered.  ")).toBeNull();
  });
});

describe("payoutFor", () => {
  it("refunds the full amount to the buyer with no fee", () => {
    expect(payoutFor("refund", b(25) * XLM, 100)).toEqual({ buyer: b(25) * XLM, seller: b(0), fee: b(0) });
  });
  it("releases to the seller minus the platform fee", () => {
    expect(payoutFor("release", b(100) * XLM, 100)).toEqual({ buyer: b(0), seller: b(99) * XLM, fee: b(1) * XLM });
  });
  it("rounds the fee down in stroops and never goes negative", () => {
    expect(payoutFor("release", b(199), 100)).toEqual({ buyer: b(0), seller: b(198), fee: b(1) });
    expect(payoutFor("release", b(10), -50).fee).toBe(b(0));
  });
});

describe("payoutState", () => {
  it("is none before a ruling", () => {
    expect(payoutState({ resolved: false, claimableAt: null, currentLedger: 10 })).toEqual({ kind: "none" });
  });
  it("waits through the appeal window, inclusive of the claimable ledger", () => {
    expect(payoutState({ resolved: true, claimableAt: 100, currentLedger: 100 })).toEqual({ kind: "waiting", ledgersLeft: 1, secondsLeft: 5 });
    expect(payoutState({ resolved: true, claimableAt: 100, currentLedger: 40 })).toEqual({ kind: "waiting", ledgersLeft: 61, secondsLeft: 305 });
  });
  it("is claimable strictly after that ledger", () => {
    expect(payoutState({ resolved: true, claimableAt: 100, currentLedger: 101 })).toEqual({ kind: "claimable" });
  });
  it("is paid once the contract removed the claimable entry", () => {
    expect(payoutState({ resolved: true, claimableAt: null, currentLedger: 500 })).toEqual({ kind: "paid" });
  });
});

describe("mediationBlocks", () => {
  it("blocks while an unconcluded window is open", () => {
    expect(mediationBlocks({ expiresAt: 200, concluded: false }, 150)).toBe(true);
    expect(mediationBlocks({ expiresAt: 200, concluded: false }, 200)).toBe(true);
  });
  it("doesn't block once expired, concluded, or when there is none", () => {
    expect(mediationBlocks({ expiresAt: 200, concluded: false }, 201)).toBe(false);
    expect(mediationBlocks({ expiresAt: 200, concluded: true }, 150)).toBe(false);
    expect(mediationBlocks(null, 150)).toBe(false);
  });
});

describe("invocationMatches", () => {
  const contractId = "CDSLTYUH6YDS5WIW3QB2CRBKPP2YSKURD36ZEK7LKSZBHIGVTKUNFMYG";
  const inv = { contractId, fn: "resolve_dispute", args: [b(7), 1] };
  it("accepts the expected call on the expected escrow and outcome", () => {
    expect(invocationMatches(inv, { contractId, fn: "resolve_dispute", escrowId: b(7), resolution: 1 })).toBe(true);
  });
  it("rejects another escrow, function, contract or outcome", () => {
    expect(invocationMatches(inv, { contractId, fn: "resolve_dispute", escrowId: b(8), resolution: 1 })).toBe(false);
    expect(invocationMatches(inv, { contractId, fn: "claim_disputed_funds", escrowId: b(7) })).toBe(false);
    expect(invocationMatches(inv, { contractId: "COTHER", fn: "resolve_dispute", escrowId: b(7) })).toBe(false);
    expect(invocationMatches(inv, { contractId, fn: "resolve_dispute", escrowId: b(7), resolution: 0 })).toBe(false);
    expect(invocationMatches(null, { contractId, fn: "resolve_dispute", escrowId: b(7) })).toBe(false);
  });
  it("ignores the outcome when not asked to check it", () => {
    expect(invocationMatches({ contractId, fn: "claim_disputed_funds", args: [b(7)] }, { contractId, fn: "claim_disputed_funds", escrowId: b(7) })).toBe(true);
  });
});

describe("durationLabel and countdownLabel", () => {
  const now = new Date("2026-11-22T12:00:00Z");
  it("says how long a dispute has been open", () => {
    expect(durationLabel("2026-11-22T11:59:50Z", now)).toBe("just now");
    expect(durationLabel("2026-11-22T11:15:00Z", now)).toBe("45 minutes");
    expect(durationLabel("2026-11-22T11:00:00Z", now)).toBe("1 hour");
    expect(durationLabel("2026-11-22T09:00:00Z", now)).toBe("3 hours");
    expect(durationLabel("2026-11-19T12:00:00Z", now)).toBe("3 days");
  });
  it("rounds a countdown", () => {
    expect(countdownLabel(30)).toBe("about a minute");
    expect(countdownLabel(600)).toBe("about 10 minutes");
    expect(countdownLabel(17_280 * 5)).toBe("about 24 hours");
  });
});

describe("buildTimeline", () => {
  it("merges state changes and payment steps oldest first", () => {
    const t = buildTimeline(
      [
        { state: "funded", label: "Payment locked", actor: "buyer", description: null, created_at: "2026-11-20T10:00:00Z" },
        { state: "disputed", label: "Disputed", actor: "system", description: "State changed", created_at: "2026-11-21T10:00:00Z" },
      ],
      [
        { step: "order_shipped", failed_action: null, tx_hash: null, error_message: null, created_at: "2026-11-20T12:00:00Z", client_at: null, actor: "seller" },
        { step: "dispute_opened", failed_action: null, tx_hash: "ab".repeat(32), error_message: null, created_at: "2026-11-21T10:00:05Z", client_at: "2026-11-21T09:59:59Z", actor: "buyer" },
      ],
    );
    expect(t.map((e) => e.title)).toEqual(["Payment locked", "Marked as shipped", "Dispute opened", "Disputed"]);
    expect(t[2]).toMatchObject({ actor: "buyer", tone: "bad", txHash: "ab".repeat(32) });
  });
});

describe("noteFingerprint", () => {
  it("is the hex SHA-256 the order page puts on-chain", async () => {
    expect(await noteFingerprint("abc")).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });
});
