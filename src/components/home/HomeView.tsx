import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/marketplace/ProductCard";
import SectionHeading from "@/components/shop/SectionHeading";
import { SHOP_CATEGORIES, matchesCategory } from "@/lib/shopDisplay";
import HomeHero from "./HomeHero";
import CategoryIndex from "./CategoryIndex";
import PriceDrops from "./PriceDrops";
import EscrowBand from "./EscrowBand";
import SellerSpotlight, { summariseSellers } from "./SellerSpotlight";
import HomeFooter from "./HomeFooter";

const JUST_LISTED = 8;

/**
 * The marketplace front page, laid out like a magazine rather than a
 * warehouse: a masthead, an index, and a handful of curated sections, each
 * built only from listings that exist. A section with nothing real to show is
 * left out rather than filled.
 *
 * `products` is every active listing, newest first.
 */
export default function HomeView({ products }: { products: Product[] }) {
  const featured = products.find((p) => p.images?.length) ?? products[0] ?? null;
  const supporting = products.filter((p) => p !== featured && p.images?.length).slice(0, 2);

  const counts: Record<string, number> = {};
  for (const { value } of SHOP_CATEGORIES) {
    counts[value] = products.filter((p) => matchesCategory(p.category, value)).length;
  }

  const justListed = products.slice(0, JUST_LISTED);
  const priceDrops = products
    .filter((p) => p.originalUsdPrice > p.usdPrice)
    .sort((a, b) => b.originalUsdPrice / b.usdPrice - a.originalUsdPrice / a.usdPrice)
    .slice(0, 5);
  const sellers = summariseSellers(products).slice(0, 4);
  const more = products.slice(JUST_LISTED, JUST_LISTED + 8);

  let section = 0;
  const next = () => String(++section).padStart(2, "0");

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[1360px] px-4 pt-[108px] sm:px-6">
        <HomeHero featured={featured} supporting={supporting} liveCount={products.length} />

        <section className="pt-16 sm:pt-24">
          <SectionHeading
            index={next()}
            eyebrow="Index"
            title="Shop by category"
            description="Counted live from what is listed right now."
          />
          <CategoryIndex counts={counts} total={products.length} />
        </section>

        {justListed.length > 0 && (
          <section className="pt-16 sm:pt-24">
            <SectionHeading
              index={next()}
              eyebrow="Fresh"
              title="Just listed"
              action={{ href: "/marketplace", label: "See everything" }}
            />
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {justListed.map((product, i) => (
                <li key={product.id}>
                  <ProductCard product={product} priority={i < 4} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {priceDrops.length > 0 && (
          <section className="pt-16 sm:pt-24">
            <SectionHeading
              index={next()}
              eyebrow="Marked down"
              title="Below their original price"
              description="Reductions sellers have set themselves, deepest first. No timers."
              action={{ href: "/marketplace?sort=price-asc", label: "Lowest prices" }}
            />
            <PriceDrops products={priceDrops} />
          </section>
        )}

        <div className="pt-16 sm:pt-24">
          <EscrowBand />
        </div>

        {sellers.length >= 2 && (
          <section className="pt-16 sm:pt-24">
            <SectionHeading
              index={next()}
              eyebrow="The people"
              title="Shops to know"
              description="Ranked by completed sales. Every shopfront is open to look through before you buy."
            />
            <SellerSpotlight sellers={sellers} />
          </section>
        )}

        {more.length > 0 && (
          <section className="pt-16 sm:pt-24">
            <SectionHeading index={next()} eyebrow="Keep browsing" title="More from the marketplace" />
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {more.map((product) => (
                <li key={product.id}>
                  <ProductCard product={product} />
                </li>
              ))}
            </ul>
          </section>
        )}

        {products.length === 0 ? (
          <EmptyMarketplace />
        ) : (
          <div className="pt-12 sm:pt-16">
            <Link
              href="/marketplace"
              className="group flex flex-col items-start justify-between gap-4 rounded-[28px] border border-line bg-surface p-6 transition-colors hover:border-accent-line hover:bg-accent-soft sm:flex-row sm:items-center sm:p-8"
            >
              <div>
                <p className="font-display text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                  Browse all {products.length.toLocaleString()}{" "}
                  {products.length === 1 ? "listing" : "listings"}
                </p>
                <p className="mt-1 text-sm text-ink-muted">Filter by category, price and rating.</p>
              </div>
              <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-ink text-bg transition-transform duration-500 group-hover:translate-x-1">
                <ArrowRight className="h-5 w-5" aria-hidden />
              </span>
            </Link>
          </div>
        )}
      </div>

      <HomeFooter />
    </div>
  );
}

function EmptyMarketplace() {
  return (
    <section className="pt-16 sm:pt-24">
      <div className="flex flex-col items-center rounded-[28px] border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent">
          <Store className="h-6 w-6" aria-hidden />
        </span>
        <h2 className="font-display mt-5 text-2xl font-bold text-ink">The shelves are empty, for now</h2>
        <p className="mt-2 max-w-md text-sm text-ink-muted">
          No listings are live yet. If you have something to sell, yours could be the first thing
          buyers see.
        </p>
        <Link
          href="/dashboard/selling/new"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-linear-to-r from-[#E0483B] to-[#FF7A59] px-5 py-2.5 text-sm font-bold text-white"
        >
          List an item
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
