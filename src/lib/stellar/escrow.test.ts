import { describe, expect, it } from "vitest";
import { EscrowError, stroopsToXlm, toEscrowError, xlmToStroops } from "./escrow";

describe("XLM ↔ stroops", () => {
  it("converts whole and fractional XLM exactly", () => {
    expect(xlmToStroops(1)).toBe(BigInt(10_000_000));
    expect(xlmToStroops(2.5)).toBe(BigInt(25_000_000));
    expect(xlmToStroops(7032.5)).toBe(BigInt(70_325_000_000));
    expect(xlmToStroops(0.0000001)).toBe(BigInt(1));
  });

  it("rounds away float noise instead of truncating", () => {
    // 0.1 + 0.2 is 0.30000000000000004 in floating point
    expect(xlmToStroops(0.1 + 0.2)).toBe(BigInt(3_000_000));
  });

  it("round-trips", () => {
    expect(stroopsToXlm(xlmToStroops(193))).toBe(193);
    expect(stroopsToXlm("99000000")).toBe(9.9);
  });
});

describe("toEscrowError", () => {
  it("keeps the contract error code and gives a readable message", () => {
    const err = toEscrowError(new Error("HostError: Error(Contract, #91)"));
    expect(err).toBeInstanceOf(EscrowError);
    expect(err.code).toBe(91);
    expect(err.message).toMatch(/already funded/i);
  });

  it("falls back to a generic message for unknown contract codes", () => {
    const err = toEscrowError(new Error("Error(Contract, #999)"));
    expect(err.code).toBe(999);
    expect(err.message).toContain("#999");
  });

  it("recognises insufficient balance and declined signatures", () => {
    expect(toEscrowError(new Error("op_underfunded")).message).toMatch(/enough XLM/);
    expect(toEscrowError(new Error("User declined access")).message).toMatch(/declined/);
  });
});
