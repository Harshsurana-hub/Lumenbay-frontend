import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import type { Product } from "@/lib/products";
import ListingPlaceholder from "@/components/shop/ListingPlaceholder";
import { initialsOf, toneFor } from "@/lib/shopDisplay";

export interface SellerSummary {
  id: string;
  name: string;
  rating: number;
  sales: number;
  listings: Product[];
}

/**
 * Groups the loaded catalogue by seller.
 *
 * Every figure comes from the seller's profile or from counting their live
 * listings; nothing is estimated. Ranked by completed sales, then by how much
 * they have on offer.
 */
export function summariseSellers(products: Product[]): SellerSummary[] {
  const byId = new Map<string, SellerSummary>();
  for (const product of products) {
    const existing = byId.get(product.sellerId);
    if (existing) {
      existing.listings.push(product);
    } else {
      byId.set(product.sellerId, {
        id: product.sellerId,
        name: product.seller,
        rating: product.sellerRating ?? 0,
        sales: product.sellerSales ?? 0,
        listings: [product],
      });
    }
  }
  return [...byId.values()].sort(
    (a, b) => b.sales - a.sales || b.listings.length - a.listings.length,
  );
}

/** "Shops to know": the people behind the listings, each with a peek at their stall. */
export default function SellerSpotlight({ sellers }: { sellers: SellerSummary[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {sellers.map((seller) => {
        const { from, to } = toneFor(seller.id);
        const peek = seller.listings.slice(0, 3);
        return (
          <li key={seller.id}>
            <Link
              href={`/seller/${seller.id}`}
              className="group block h-full rounded-[22px] border border-line bg-surface p-2 transition-all duration-500 hover:-translate-y-1 hover:border-line-strong hover:shadow-panel"
            >
              <div className="grid h-28 grid-cols-3 gap-1 overflow-hidden rounded-[16px]">
                {peek.map((listing) => (
                  <div key={listing.id} className="relative overflow-hidden bg-surface-2">
                    {listing.images?.[0] ? (
                      <Image
                        src={listing.images[0]}
                        alt=""
                        fill
                        sizes="120px"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <ListingPlaceholder seed={listing.id} category={listing.category} showLabel={false} />
                    )}
                  </div>
                ))}
                {Array.from({ length: 3 - peek.length }).map((_, i) => (
                  <div key={i} className="lb-dots bg-surface-2 text-line-strong" aria-hidden />
                ))}
              </div>

              <div className="flex items-center gap-3 px-2 pb-2 pt-4">
                <span
                  className="font-display grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold text-white ring-4 ring-surface"
                  style={{ background: `linear-gradient(135deg, ${to}, ${from})` }}
                  aria-hidden
                >
                  {initialsOf(seller.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{seller.name}</p>
                  <p className="tnum mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                    {seller.sales > 0 ? (
                      <>
                        <Star className="h-3 w-3 fill-[#F5A25D] text-[#F5A25D]" aria-hidden />
                        <span className="font-semibold text-ink">{seller.rating.toFixed(1)}</span>
                        <span aria-hidden>·</span>
                        <span>{seller.sales.toLocaleString()} sales</span>
                      </>
                    ) : (
                      <span>New seller</span>
                    )}
                    <span aria-hidden>·</span>
                    <span>{seller.listings.length} live</span>
                  </p>
                </div>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 text-ink-faint transition-all duration-500 group-hover:rotate-45 group-hover:text-accent"
                  aria-hidden
                />
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
