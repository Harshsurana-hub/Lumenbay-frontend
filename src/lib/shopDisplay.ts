import {
  Cpu,
  Dumbbell,
  Gamepad2,
  Gem,
  Package,
  Shirt,
  Sofa,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

/**
 * Presentation helpers for the shop: category labels and icons, price
 * typography, and the deterministic tints used where a listing or seller has
 * no photograph.
 *
 * Nothing here reads or writes data. It only decides how data already fetched
 * elsewhere is drawn.
 */

export interface ShopCategory {
  label: string;
  /** Matched against the category name stored on each listing. */
  value: string;
  icon: LucideIcon;
}

/** The categories the shop navigation offers, in display order. */
export const SHOP_CATEGORIES: ShopCategory[] = [
  { label: "Electronics", value: "Electronics", icon: Cpu },
  { label: "Fashion", value: "Fashion", icon: Shirt },
  { label: "Home & Living", value: "Home", icon: Sofa },
  { label: "Beauty", value: "Beauty", icon: Sparkles },
  { label: "Sports", value: "Sports", icon: Dumbbell },
  { label: "Gaming", value: "Gaming", icon: Gamepad2 },
  { label: "NFTs & Digital", value: "NFTs", icon: Gem },
];

function normalise(value: string): string {
  return value.trim().toLowerCase();
}

/**
 * Whether a listing's category belongs under one of the navigation entries.
 *
 * Loose on purpose: the navigation says "Home" while the catalogue may say
 * "Home & Living", and both should land in the same place.
 */
export function matchesCategory(productCategory: string, value: string): boolean {
  const a = normalise(productCategory);
  const b = normalise(value);
  if (!b) return true;
  return a === b || a.startsWith(b) || b.startsWith(a);
}

export function findShopCategory(value: string): ShopCategory | undefined {
  return SHOP_CATEGORIES.find((category) => matchesCategory(category.value, value));
}

export function categoryIcon(categoryName: string): LucideIcon {
  return findShopCategory(categoryName)?.icon ?? Package;
}

/**
 * Splits an amount into its whole and fractional parts, so the cents can be
 * set smaller and quieter than the number a buyer actually reads.
 */
export function splitAmount(amount: number, maxFractionDigits = 2): { whole: string; fraction: string } {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: maxFractionDigits,
  }).format(amount);
  const [whole, fraction = ""] = formatted.split(".");
  // "407.4" reads as a typo next to "722.65"; a fraction, when there is one,
  // always shows every place.
  return { whole, fraction: fraction ? `.${fraction.padEnd(maxFractionDigits, "0")}` : "" };
}

/** Small, stable string hash, so a listing always gets the same tint. */
export function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Warm gradient pairs drawn from the brand ramp. Used for listings without a
 * photograph and for seller banners, so an empty slot reads as designed
 * rather than as missing.
 */
const TONES: [string, string][] = [
  ["#2A0F0B", "#E0483B"],
  ["#1A0907", "#FF7A59"],
  ["#3A1410", "#FFB4A2"],
  ["#160A12", "#FF6B5B"],
  ["#2B1608", "#F5A25D"],
  ["#120D14", "#C2410C"],
];

export function toneFor(seed: string): { from: string; to: string } {
  const [from, to] = TONES[hashString(seed) % TONES.length];
  return { from, to };
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

/**
 * The page numbers to show in a pager, with `null` marking a gap.
 * Always includes the first, the last, and the pages either side of the
 * current one, so a long catalogue does not produce a row of forty buttons.
 */
export function pageWindow(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);

  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((n) => n >= 1 && n <= pageCount).sort((a, b) => a - b);

  const result: (number | null)[] = [];
  for (const [index, number] of sorted.entries()) {
    if (index > 0 && number - sorted[index - 1] > 1) result.push(null);
    result.push(number);
  }
  return result;
}
