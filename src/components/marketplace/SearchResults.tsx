import Link from "next/link";
import { ArrowUpRight, Search, SearchX, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/lib/products";
import ProductCard from "./ProductCard";
import { SHOP_CATEGORIES } from "@/lib/shopDisplay";

/**
 * Search results: the query set large, the count beside it, and a way on to
 * the filterable marketplace with the same words already in it.
 */
export default function SearchResults({ query, products }: { query: string; products: Product[] }) {
  const count = products.length;

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-20 pt-[108px] sm:px-6">
      <header className="relative overflow-hidden rounded-[28px] border border-line bg-surface px-5 py-8 sm:rounded-[36px] sm:px-10 sm:py-10">
        <div aria-hidden className="lb-dots pointer-events-none absolute inset-0 text-line" />
        <Search
          aria-hidden
          strokeWidth={0.75}
          className="pointer-events-none absolute -bottom-12 -right-6 h-56 w-56 text-accent/10 sm:h-72 sm:w-72"
        />

        <div className="relative">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Search</p>
          <h1 className="font-display mt-2 break-words text-[40px] font-bold leading-[0.95] tracking-[-0.035em] text-ink sm:text-[64px]">
            {query ? <>“{query}”</> : "Everything"}
          </h1>
          <p className="tnum mt-4 text-sm text-ink-muted">
            {query
              ? `${count.toLocaleString()} ${count === 1 ? "listing matches" : "listings match"} your search`
              : `Showing all ${count.toLocaleString()} listings. Type in the search bar to narrow them down.`}
          </p>
          <Link
            href={query ? `/marketplace?q=${encodeURIComponent(query)}` : "/marketplace"}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            Filter and sort these results
          </Link>
        </div>
      </header>

      {count > 0 ? (
        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product, i) => (
            <li key={product.id}>
              <ProductCard product={product} priority={i < 4} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="relative mt-8 overflow-hidden rounded-[28px] border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft text-accent">
            <SearchX className="h-7 w-7" aria-hidden />
          </span>
          <h2 className="font-display mt-5 text-2xl font-bold text-ink">Nothing by that name</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            Try a broader word, check the spelling, or start from a category instead.
          </p>
          <ul className="mx-auto mt-7 flex max-w-2xl flex-wrap justify-center gap-2">
            {SHOP_CATEGORIES.map(({ label, value, icon: Icon }) => (
              <li key={value}>
                <Link
                  href={`/home?category=${encodeURIComponent(value)}`}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-3.5 py-2 text-[13px] font-medium text-ink-muted transition-colors hover:border-accent-line hover:text-accent"
                >
                  <Icon className="h-3.5 w-3.5" aria-hidden />
                  {label}
                  <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
