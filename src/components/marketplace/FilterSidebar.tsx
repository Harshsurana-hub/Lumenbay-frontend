"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Check, ShieldCheck, SlidersHorizontal, Star, X } from "lucide-react";
import type { Category } from "@/lib/listings";
import { categoryIcon } from "@/lib/shopDisplay";
import { cn } from "@/lib/utils";

/**
 * Marketplace filters.
 *
 * Categories come from the `categories` table, prices are in USD because that
 * is what listings are priced in, and escrow status belongs to an order rather
 * than to the thing being sold.
 *
 * All state lives in the URL, so a filtered view can be linked and the back
 * button behaves.
 */

interface FilterSidebarProps {
  categories: Category[];
  isDrawerOpen: boolean;
  closeDrawer: () => void;
}

const RATINGS = [
  { label: "Any", value: "" },
  { label: "4.0+", value: "4" },
  { label: "4.5+", value: "4.5" },
];

export default function FilterSidebar({
  categories,
  isDrawerOpen,
  closeDrawer,
}: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedCategories = searchParams.getAll("category");
  const minRating = searchParams.get("minRating") ?? "";

  // Price is held locally while being typed. Pushing a new URL on every
  // keystroke would put a history entry behind each digit and fire a query for
  // "1", "12", "125" on the way to 1250.
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") ?? "");

  // Escape closes the drawer, as it would any dialog.
  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  const apply = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      // Any filter change invalidates the page number — page 4 of the old
      // result set is usually empty in the new one.
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const toggleCategory = (id: string) =>
    apply((params) => {
      const current = params.getAll("category");
      params.delete("category");
      const next = current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id];
      for (const value of next) params.append("category", value);
    });

  const applyPrice = () =>
    apply((params) => {
      if (minPrice.trim()) params.set("minPrice", minPrice.trim());
      else params.delete("minPrice");
      if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
      else params.delete("maxPrice");
    });

  const setRating = (value: string) =>
    apply((params) => {
      if (value) params.set("minRating", value);
      else params.delete("minRating");
    });

  const clearAll = () => {
    setMinPrice("");
    setMaxPrice("");
    apply((params) => {
      for (const key of ["category", "minPrice", "maxPrice", "minRating"]) {
        params.delete(key);
      }
    });
  };

  const activeCount =
    selectedCategories.length +
    (searchParams.get("minPrice") ? 1 : 0) +
    (searchParams.get("maxPrice") ? 1 : 0) +
    (minRating ? 1 : 0);

  const priceInput =
    "tnum h-11 w-full rounded-xl border border-line-strong bg-bg pl-7 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:shadow-[0_0_0_4px_var(--accent-soft)]";

  const panel = (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="font-display flex items-center gap-2 text-lg font-bold text-ink">
          <SlidersHorizontal className="h-4 w-4 text-accent" aria-hidden="true" />
          Refine
        </h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full px-2 py-1 text-xs font-semibold text-accent transition-colors hover:bg-accent-soft"
          >
            Clear all ({activeCount})
          </button>
        )}
      </div>

      <fieldset>
        <legend className="label mb-3">Category</legend>
        <div className="space-y-1">
          {categories.map((category) => {
            const checked = selectedCategories.includes(category.id);
            const Icon = categoryIcon(category.name);
            return (
              <label
                key={category.id}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-2.5 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--accent)]",
                  checked ? "bg-accent-soft font-semibold text-ink" : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleCategory(category.id)}
                  className="peer sr-only"
                />
                <Icon className={cn("h-4 w-4 shrink-0", checked ? "text-accent" : "text-ink-faint")} aria-hidden />
                <span className="flex-1">{category.name}</span>
                <span
                  aria-hidden
                  className={cn(
                    "grid h-5 w-5 place-items-center rounded-md border transition-colors",
                    checked ? "border-accent bg-accent text-on-accent" : "border-line-strong bg-bg",
                  )}
                >
                  {checked && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="label mb-3">Price (USD)</legend>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
              $
            </span>
            <input
              type="number"
              min="0"
              inputMode="decimal"
              value={minPrice}
              onChange={(event) => setMinPrice(event.target.value)}
              onBlur={applyPrice}
              onKeyDown={(event) => event.key === "Enter" && applyPrice()}
              placeholder="Min"
              aria-label="Minimum price in dollars"
              className={priceInput}
            />
          </div>
          <span className="h-px w-3 bg-line-strong" aria-hidden="true" />
          <div className="relative flex-1">
            <span aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-faint">
              $
            </span>
            <input
              type="number"
              min="0"
              inputMode="decimal"
              value={maxPrice}
              onChange={(event) => setMaxPrice(event.target.value)}
              onBlur={applyPrice}
              onKeyDown={(event) => event.key === "Enter" && applyPrice()}
              placeholder="Max"
              aria-label="Maximum price in dollars"
              className={priceInput}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="label mb-3">Rating</legend>
        <div className="grid grid-cols-3 gap-1 rounded-xl border border-line bg-bg p-1">
          {RATINGS.map((option) => {
            const checked = minRating === option.value;
            return (
              <label
                key={option.label}
                className={cn(
                  "flex cursor-pointer items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--accent)]",
                  checked ? "bg-ink text-bg" : "text-ink-muted hover:text-ink",
                )}
              >
                <input
                  type="radio"
                  name="minRating"
                  checked={checked}
                  onChange={() => setRating(option.value)}
                  className="sr-only"
                />
                {option.value && <Star className="h-3 w-3 fill-current" aria-hidden />}
                {option.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="rounded-2xl border border-accent-line bg-accent-soft p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShieldCheck className="h-4 w-4 text-accent" aria-hidden />
          Nothing to filter for here
        </p>
        <p className="mt-1 text-xs leading-relaxed text-ink-muted">
          Every listing is paid through the same escrow contract. Your money is released only when
          you confirm delivery.
        </p>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-[168px] rounded-[22px] border border-line bg-surface p-5">{panel}</div>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-[60] lg:hidden",
          isDrawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!isDrawerOpen}
        inert={!isDrawerOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity",
            isDrawerOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={closeDrawer}
        />
        <div
          role="dialog"
          aria-modal={isDrawerOpen}
          aria-label="Filters"
          className={cn(
            "absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-[28px] border-t border-line bg-surface p-5 pb-8 shadow-modal transition-transform duration-300",
            isDrawerOpen ? "translate-y-0" : "translate-y-full",
          )}
        >
          <div aria-hidden className="mx-auto mb-5 h-1 w-10 rounded-full bg-line-strong" />
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Close filters"
            className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full bg-surface-2 text-ink-muted hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
          {panel}
          <button
            type="button"
            onClick={closeDrawer}
            className="mt-7 w-full rounded-full bg-ink py-3.5 text-sm font-bold text-bg"
          >
            Show results
          </button>
        </div>
      </div>
    </>
  );
}
