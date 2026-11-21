import { describe, expect, it } from "vitest";
import { buildOrderTag, parseOrderTag } from "./orderTag";

const PRODUCT = "11111111-2222-4333-8444-555555555555";
const BUYER = "aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee";

describe("order tag", () => {
  it("round-trips product, buyer and nonce", () => {
    const tag = buildOrderTag(PRODUCT, BUYER, "nonce-1");
    expect(parseOrderTag(tag)).toEqual({ productId: PRODUCT, buyerUserId: BUYER, nonce: "nonce-1" });
  });

  it("gives each purchase a different tag by default", () => {
    expect(buildOrderTag(PRODUCT, BUYER)).not.toEqual(buildOrderTag(PRODUCT, BUYER));
  });

  it("rejects the older tag that had no buyer", () => {
    expect(parseOrderTag(`lumenbay:${PRODUCT}:${crypto.randomUUID()}`)).toBeNull();
  });

  it("rejects malformed tags", () => {
    expect(parseOrderTag(null)).toBeNull();
    expect(parseOrderTag("")).toBeNull();
    expect(parseOrderTag(`other:${PRODUCT}:${BUYER}:x`)).toBeNull();
    expect(parseOrderTag(`lumenbay:not-a-uuid:${BUYER}:x`)).toBeNull();
    expect(parseOrderTag(`lumenbay:${PRODUCT}:${BUYER}:`)).toBeNull();
  });
});
