import { beforeEach, describe, expect, it } from "vitest";
import { escrowsForWallet, eventsForEscrow, recordPaymentEvent, unfundedEscrows } from "./paymentJournal";

const base = { network: "testnet", contractId: "CTEST", buyer: "GBUYER", seller: "GSELLER", amountXlm: 10 };

describe("payment journal", () => {
  beforeEach(() => localStorage.clear());

  it("records events with id and timestamp, and lists them per escrow", () => {
    recordPaymentEvent({ ...base, step: "escrow_created", escrowId: "1", txHash: "aaa" });
    recordPaymentEvent({ ...base, step: "escrow_funded", escrowId: "1", txHash: "bbb" });
    recordPaymentEvent({ ...base, step: "escrow_created", escrowId: "2", txHash: "ccc" });

    const events = eventsForEscrow("1");
    expect(events.map((e) => e.step)).toEqual(["escrow_created", "escrow_funded"]);
    expect(events[0].id).toBeTruthy();
    expect(Date.parse(events[0].at)).not.toBeNaN();
  });

  it("flags escrows that were created but never funded", () => {
    recordPaymentEvent({ ...base, step: "escrow_created", escrowId: "1" });
    recordPaymentEvent({ ...base, step: "escrow_funded", escrowId: "1" });
    recordPaymentEvent({ ...base, step: "escrow_created", escrowId: "2" });
    recordPaymentEvent({ ...base, step: "step_failed", failedAction: "fund", escrowId: "2", errorCode: 13 });

    expect(unfundedEscrows("GBUYER").map((e) => e.escrowId)).toEqual(["2"]);
    expect(unfundedEscrows("GSOMEONE_ELSE")).toEqual([]);
  });

  it("returns the latest state of each escrow for a wallet, as buyer or seller", () => {
    recordPaymentEvent({ ...base, step: "escrow_created", escrowId: "1" });
    recordPaymentEvent({ ...base, step: "escrow_released", escrowId: "1" });

    const asBuyer = escrowsForWallet("GBUYER");
    const asSeller = escrowsForWallet("GSELLER");
    expect(asBuyer).toHaveLength(1);
    expect(asBuyer[0].step).toBe("escrow_released");
    expect(asSeller[0].escrowId).toBe("1");
  });

  it("keeps failure details for debugging", () => {
    recordPaymentEvent({ ...base, step: "step_failed", failedAction: "release", escrowId: "5", errorCode: 11, errorMessage: "wrong state" });
    const [failure] = eventsForEscrow("5");
    expect(failure).toMatchObject({ failedAction: "release", errorCode: 11, errorMessage: "wrong state" });
  });
});
