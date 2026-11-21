import { describe, expect, it } from "vitest";
import { decimalXlmToStroops, orderStatusFor, stepsToMatchChain } from "./escrowState";

describe("stepsToMatchChain", () => {
  it("keeps shipping detail while the chain says Funded", () => {
    expect(stepsToMatchChain("funded", "Funded")).toEqual([]);
    expect(stepsToMatchChain("in_transit", "Funded")).toEqual([]);
  });

  it("follows a release from any holding state", () => {
    expect(stepsToMatchChain("funded", "Released")).toEqual(["released"]);
    expect(stepsToMatchChain("in_transit", "Released")).toEqual(["released"]);
    expect(stepsToMatchChain("disputed", "Released")).toEqual(["released"]);
    expect(stepsToMatchChain("released", "Released")).toEqual([]);
  });

  it("goes through disputed when a refund happened between syncs", () => {
    expect(stepsToMatchChain("in_transit", "Refunded")).toEqual(["disputed", "refunded"]);
    expect(stepsToMatchChain("disputed", "Refunded")).toEqual(["refunded"]);
  });

  it("returns a resolved dispute to escrow", () => {
    expect(stepsToMatchChain("disputed", "Funded")).toEqual(["in_escrow"]);
  });

  it("never moves a terminal state", () => {
    expect(stepsToMatchChain("released", "Disputed")).toEqual([]);
    expect(stepsToMatchChain("refunded", "Released")).toEqual([]);
  });
});

describe("orderStatusFor", () => {
  it("maps settlement to order status", () => {
    expect(orderStatusFor("in_transit")).toBe("paid");
    expect(orderStatusFor("released")).toBe("fulfilled");
    expect(orderStatusFor("refunded")).toBe("refunded");
  });
});

describe("decimalXlmToStroops", () => {
  it("converts exactly", () => {
    expect(decimalXlmToStroops("25.0000000")).toBe(BigInt(250_000_000));
    expect(decimalXlmToStroops("0.1")).toBe(BigInt(1_000_000));
    expect(decimalXlmToStroops("12")).toBe(BigInt(120_000_000));
    expect(decimalXlmToStroops(1.5)).toBe(BigInt(15_000_000));
  });

  it("rejects junk", () => {
    expect(() => decimalXlmToStroops("-1")).toThrow();
    expect(() => decimalXlmToStroops("abc")).toThrow();
  });
});
