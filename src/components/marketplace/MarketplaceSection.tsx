"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Search, SearchX, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import FilterSidebar from "./FilterSidebar";
import ProductCard from "./ProductCard";
import type { Category } from "@/lib/listings";
import type { Product, SortOption } from "@/lib/products";
import { pageWindow } from "@/lib/shopDisplay";
import { cn } from "@/lib/utils";

/**
 * The marketplace grid.
 *
 * Products, the page and the total arrive from the server component that
 * queried them, so this holds no data of its own — it renders what it is
 * given and writes the user's choices back to the URL, which is what causes
 * the next query.
 */

interface MarketplaceSectionProps {
  products: Product[];
  categories: Category[];
  total: number;
  page: number;
  pageCount: number;
  search: string;
  sort: SortOption;
  pageSize?: number;
}

const SORT_LABELS: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  rating: "Best rated",
};

const SORT_SHORT: Record<SortOption, string> = {
  newest: "Newest",
  "price-asc": "Price ↑",
  "price-desc": "Price ↓",
  rating: "Top rated",
};

export default function MarketplaceSection({
  products,
  categories,
  total,
  page,
  pageCount,
  search,
  sort,
  pageSize = 12,
}: MarketplaceSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [query, setQuery] = useState(search);

  const push = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const goToPage = (next: number) =>
    push((params) => {
      if (next <= 1) params.delete("page");
      else params.set("page", String(next));
    });

  const changeSort = (next: SortOption) =>
    push((params) => {
      if (next === "newest") params.delete("sort");
      else params.set("sort", next);
      params.delete("page");
    });

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    push((params) => {
      const trimmed = query.trim();
      if (trimmed) params.set("q", trimmed);
      else params.delete("q");
      params.delete("page");
    });
  };

  const removeParam = (key: string, value?: string) =>
    push((params) => {
      if (value === undefined) {
        params.delete(key);
      } else {
        const rest = params.getAll(key).filter((v) => v !== value);
        params.delete(key);
        for (const v of rest) params.append(key, v);
      }
      params.delete("page");
    });

  const activeFilterCount = Array.from(searchParams.keys()).filter(
    (key) => key !== "q" && key !== "page" && key !== "sort",
  ).length;

  // Every active constraint, as a chip that removes itself.
  const chips: { key: string; label: string; onRemove: () => void }[] = [];
  if (search) chips.push({ key: "q", label: `“${search}”`, onRemove: () => { setQuery(""); removeParam("q"); } });
  for (const id of searchParams.getAll("category")) {
    const name = categories.find((c) => c.id === id)?.name ?? "Category";
    chips.push({ key: `category-${id}`, label: name, onRemove: () => removeParam("category", id) });
  }
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  if (minPrice) chips.push({ key: "minPrice", label: `From $${minPrice}`, onRemove: () => removeParam("minPrice") });
  if (maxPrice) chips.push({ key: "maxPrice", label: `Up to $${maxPrice}`, onRemove: () => removeParam("maxPrice") });
  const minRating = searchParams.get("minRating");
  if (minRating) chips.push({ key: "minRating", label: `${minRating}★ and up`, onRemove: () => removeParam("minRating") });

  const firstShown = total === 0 ? 0 : (page - 1) * pageSize + 1;

  return (
    <section className="mx-auto w-full max-w-[1360px] px-4 pb-16 sm:px-6">
      {/* Masthead */}
      <header className="relative overflow-hidden rounded-[28px] border border-line bg-surface px-5 py-7 sm:rounded-[36px] sm:px-10 sm:py-10">
        <div aria-hidden className="lb-dots pointer-events-none absolute inset-0 text-line" />
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full bg-accent-soft blur-3xl" />

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Marketplace</p>
            <h1 className="font-display mt-2 text-[40px] font-bold leading-[0.95] tracking-[-0.035em] text-ink sm:text-[64px]">
              {search ? (
                <>
                  Results for <span className="text-accent">“{search}”</span>
                </>
              ) : (
                "Everything for sale"
              )}
            </h1>
            <p className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" aria-hidden />
              <span>
                <span className="tnum font-semibold text-ink">{total.toLocaleString()}</span>{" "}
                {total === 1 ? "listing" : "listings"}, every one paid through escrow
              </span>
            </p>
          </div>

          <form onSubmit={submitSearch} role="search" className="w-full lg:max-w-sm">
            <label htmlFor="marketplace-search" className="sr-only">
              Search the marketplace
            </label>
            <div className="flex h-12 items-center rounded-full border border-line-strong bg-bg pl-4 pr-1.5 transition-colors focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--accent-soft)]">
              <Search className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden />
              <input
                id="marketplace-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search within the marketplace"
                className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-ink-faint"
              />
              <button
                type="submit"
                className="rounded-full bg-ink px-4 py-2 text-xs font-bold text-bg transition-colors hover:bg-accent hover:text-on-accent"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Toolbar */}
      <div className="sticky top-24 z-30 -mx-4 mt-4 border-b border-line bg-bg/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            Filters
            {activeFilterCount > 0 && (
              <span className="tnum grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] text-on-accent">
                {activeFilterCount}
              </span>
            )}
          </button>

          <div className="lb-rail flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto">
            {chips.length === 0 ? (
              <p className="hidden text-sm text-ink-faint lg:block">
                Showing{" "}
                <span className="tnum">
                  {firstShown.toLocaleString()}–{(firstShown + products.length - 1).toLocaleString()}
                </span>{" "}
                of <span className="tnum">{total.toLocaleString()}</span>
              </p>
            ) : (
              chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.onRemove}
                  aria-label={`Remove filter ${chip.label}`}
                  className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent-line bg-accent-soft py-1.5 pl-3 pr-2 text-xs font-semibold text-accent transition-colors hover:border-accent"
                >
                  {chip.label}
                  <X className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100" aria-hidden />
                </button>
              ))
            )}
          </div>

          {/* Sort: segmented on wide screens, a native select on narrow ones */}
          <div
            role="radiogroup"
            aria-label="Sort listings"
            className="hidden shrink-0 items-center rounded-full border border-line bg-surface p-1 md:flex"
          >
            {(Object.keys(SORT_SHORT) as SortOption[]).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={sort === value}
                title={SORT_LABELS[value]}
                onClick={() => changeSort(value)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors",
                  sort === value ? "bg-ink text-bg" : "text-ink-muted hover:text-ink",
                )}
              >
                {SORT_SHORT[value]}
              </button>
            ))}
          </div>
          <label htmlFor="sort" className="sr-only">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => changeSort(event.target.value as SortOption)}
            className="shrink-0 rounded-full border border-line-strong bg-surface px-3 py-2 text-sm font-semibold text-ink focus:border-accent focus:outline-none md:hidden"
          >
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 flex gap-8">
        <FilterSidebar
          categories={categories}
          isDrawerOpen={isMobileFiltersOpen}
          closeDrawer={() => setIsMobileFiltersOpen(false)}
        />

        <div className="min-w-0 flex-1">
          {products.length === 0 ? (
            <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-[28px] border border-dashed border-line-strong bg-surface p-8 text-center">
              <div aria-hidden className="lb-dots pointer-events-none absolute inset-0 text-line" />
              <span className="relative grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft text-accent">
                <SearchX className="h-7 w-7" aria-hidden="true" />
              </span>
              <h2 className="font-display relative mt-5 text-2xl font-bold text-ink">Nothing matches</h2>
              <p className="relative mt-2 max-w-md text-sm text-ink-muted">
                {activeFilterCount > 0 || search
                  ? "Try widening the price range or clearing a filter."
                  : "No listings are live yet. If you have something to sell, you could be the first."}
              </p>
              {activeFilterCount > 0 || search ? (
                <Link
                  href="/marketplace"
                  className="relative mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                >
                  Clear everything
                </Link>
              ) : (
                <Link
                  href="/dashboard/selling/new"
                  className="relative mt-6 rounded-full bg-linear-to-r from-[#E0483B] to-[#FF7A59] px-5 py-2.5 text-sm font-bold text-white"
                >
                  List an item
                </Link>
              )}
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
                {products.map((product, i) => (
                  <li key={product.id}>
                    <ProductCard
                      product={product}
                      priority={i < 3}
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 30vw, 340px"
                    />
                  </li>
                ))}
              </ul>

              {pageCount > 1 && (
                <nav
                  aria-label="Pagination"
                  className="mt-12 flex flex-col items-center gap-4 border-t border-line pt-8 sm:flex-row sm:justify-between"
                >
                  <p className="tnum text-sm text-ink-faint">
                    Page <span className="font-semibold text-ink">{page}</span> of {pageCount}
                  </p>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      aria-label="Previous page"
                      className="grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-surface text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                    </button>

                    {pageWindow(page, pageCount).map((number, index) =>
                      number === null ? (
                        <span key={`gap-${index}`} className="px-1 text-ink-faint" aria-hidden>
                          …
                        </span>
                      ) : (
                        <button
                          key={number}
                          type="button"
                          onClick={() => goToPage(number)}
                          aria-current={number === page ? "page" : undefined}
                          aria-label={`Page ${number}`}
                          className={cn(
                            "tnum grid h-10 min-w-10 place-items-center rounded-full px-2 text-sm font-semibold transition-colors",
                            number === page
                              ? "bg-linear-to-br from-[#E0483B] to-[#FF7A59] text-white shadow-[0_8px_20px_-8px_rgba(224,72,59,0.8)]"
                              : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                          )}
                        >
                          {number}
                        </button>
                      ),
                    )}

                    <button
                      type="button"
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= pageCount}
                      aria-label="Next page"
                      className="grid h-10 w-10 place-items-center rounded-full border border-line-strong bg-surface text-ink transition-colors hover:border-ink disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </nav>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
