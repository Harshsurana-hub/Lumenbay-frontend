import { describe, expect, it } from "vitest";
import { matchesCategory, pageWindow, splitAmount } from "./shopDisplay";

describe("splitAmount", () => {
  it("separates the fraction so it can be set smaller", () => {
    expect(splitAmount(1234.5)).toEqual({ whole: "1,234", fraction: ".50" });
    expect(splitAmount(1234.567)).toEqual({ whole: "1,234", fraction: ".57" });
  });

  it("returns no fraction for whole amounts", () => {
    expect(splitAmount(250)).toEqual({ whole: "250", fraction: "" });
  });
});

describe("pageWindow", () => {
  it("lists every page when there are few", () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("collapses distant pages into gaps", () => {
    expect(pageWindow(10, 20)).toEqual([1, null, 9, 10, 11, null, 20]);
    expect(pageWindow(1, 20)).toEqual([1, 2, null, 20]);
    expect(pageWindow(20, 20)).toEqual([1, null, 19, 20]);
  });
});

describe("matchesCategory", () => {
  it("matches loosely so navigation labels find catalogue names", () => {
    expect(matchesCategory("Home & Living", "Home")).toBe(true);
    expect(matchesCategory("electronics", "Electronics")).toBe(true);
    expect(matchesCategory("Fashion", "Beauty")).toBe(false);
  });
});
