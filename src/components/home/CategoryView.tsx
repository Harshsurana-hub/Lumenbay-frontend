import Link from "next/link";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/marketplace/ProductCard";
import { SHOP_CATEGORIES, findShopCategory, matchesCategory } from "@/lib/shopDisplay";
import CategoryIcon from "@/components/shop/CategoryIcon";
import { cn } from "@/lib/utils";
import HomeFooter from "./HomeFooter";

/**
 * `/home?category=…`: one category, given a cover of its own.
 *
 * The category links in the shop navigation have always pointed here; the
 * page used to ignore the parameter and show everything regardless.
 */
export default function CategoryView({ products, category }: { products: Product[]; category: string }) {
  const known = findShopCategory(category);
  const label = known?.label ?? category;
  const listings = products.filter((p) => matchesCategory(p.category, category));

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[1360px] px-4 pt-[108px] sm:px-6">
        <header className="relative overflow-hidden rounded-[28px] border border-line bg-surface px-5 py-8 sm:rounded-[36px] sm:px-10 sm:py-12">
          <div aria-hidden className="lb-dots pointer-events-none absolute inset-0 text-line" />
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-soft blur-3xl"
          />
          <CategoryIcon
            category={category}
            aria-hidden
            strokeWidth={0.75}
            className="pointer-events-none absolute -bottom-10 right-2 h-56 w-56 text-accent/15 sm:right-10 sm:h-72 sm:w-72"
          />

          <div className="relative">
            <Link
              href="/home"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted transition-colors hover:text-accent"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
              Discover
            </Link>
            <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Category</p>
            <h1 className="font-display mt-2 text-[44px] font-bold leading-[0.95] tracking-[-0.035em] text-ink sm:text-[72px]">
              {label}
            </h1>
            <p className="tnum mt-4 text-sm text-ink-muted">
              {listings.length > 0
                ? `${listings.length.toLocaleString()} live ${listings.length === 1 ? "listing" : "listings"}, each paid through escrow`
                : "Nothing listed here yet"}
            </p>
            <Link
              href="/marketplace"
              className="mt-6 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden />
              Filter by price and rating
            </Link>
          </div>
        </header>

        <nav aria-label="Other categories" className="lb-rail -mx-4 mt-5 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
          {SHOP_CATEGORIES.map(({ label: name, value, icon: CatIcon }) => {
            const active = known?.value === value;
            return (
              <Link
                key={value}
                href={`/home?category=${encodeURIComponent(value)}`}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-2 text-[13px] font-medium transition-colors",
                  active
                    ? "border-ink bg-ink text-bg"
                    : "border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink",
                )}
              >
                <CatIcon className="h-3.5 w-3.5" aria-hidden />
                {name}
              </Link>
            );
          })}
        </nav>

        <section className="pt-8 sm:pt-10" aria-label={`${label} listings`}>
          {listings.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {listings.map((product, i) => (
                <li key={product.id}>
                  <ProductCard product={product} priority={i < 4} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center rounded-[28px] border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent">
                <CategoryIcon category={category} className="h-6 w-6" aria-hidden />
              </span>
              <h2 className="font-display mt-5 text-2xl font-bold text-ink">No {label.toLowerCase()} yet</h2>
              <p className="mt-2 max-w-md text-sm text-ink-muted">
                Nobody has listed anything here so far. Have a look around the rest of the marketplace.
              </p>
              <Link
                href="/marketplace"
                className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
              >
                Browse everything
              </Link>
            </div>
          )}
        </section>
      </div>

      <HomeFooter />
    </div>
  );
}
