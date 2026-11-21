"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Heart, ShieldCheck, Star } from "lucide-react";
import { useEffect, useState } from "react";
import type { Product } from "@/lib/products";
import { isWishlisted, toggleWishlist } from "@/lib/wishlistStore";
import PriceTag from "@/components/shop/PriceTag";
import ListingPlaceholder from "@/components/shop/ListingPlaceholder";
import { cn } from "@/lib/utils";

/**
 * One listing in a grid.
 *
 * Built like a mounted print: the photograph sits inset inside a soft card,
 * the way a gallery mats a picture, with the price set as type underneath.
 * The listing's name is the one link; its hit area is stretched over the whole
 * card, so a screen reader hears one link per listing instead of three, while
 * the seller link and the wishlist button sit above it as their own controls.
 */
export default function ProductCard({
  product,
  priority = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 320px",
  className,
}: {
  product: Product;
  /** Load the photograph eagerly, for cards above the fold. */
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const update = () => setWishlisted(isWishlisted(product.id));
    update();
    window.addEventListener("wishlist-change", update);
    return () => window.removeEventListener("wishlist-change", update);
  }, [product.id]);

  function handleWishlist(event: React.MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    setWishlisted(toggleWishlist(product.id));
  }

  const cover = product.images?.[0];
  const discounted = product.originalUsdPrice > product.usdPrice;
  const discount =
    product.discountPercent > 0
      ? product.discountPercent
      : discounted
        ? Math.round((1 - product.usdPrice / product.originalUsdPrice) * 100)
        : 0;

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-[22px] border border-line bg-surface p-1.5 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_24px_60px_-28px_rgba(224,72,59,0.45)] sm:p-2",
        className,
      )}
    >
      {/* Photograph */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-surface-2">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            priority={priority}
            sizes={sizes}
            className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.06]"
          />
        ) : (
          <ListingPlaceholder
            seed={product.id}
            category={product.category}
            className="transition-transform duration-[900ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]"
          />
        )}

        {/* A whisper of shade at the foot of the image, so the seal stays
            legible over a white product shot. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/35 to-transparent"
        />

        {(discount > 0 || product.badge) && (
          <div className="pointer-events-none absolute left-2 right-11 top-2 flex flex-wrap gap-1 sm:left-2.5 sm:right-12 sm:top-2.5">
            {discount > 0 && (
              <span className="tnum rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold leading-none text-[#B2271B] shadow-sm backdrop-blur-md">
                −{discount}%
              </span>
            )}
            {product.badge && <Badge badge={product.badge} />}
          </div>
        )}

        <span className="pointer-events-none absolute bottom-2 left-2 inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/40 py-1 pl-1.5 pr-2 text-[10px] font-semibold leading-none text-white backdrop-blur-md sm:bottom-2.5 sm:left-2.5">
          <ShieldCheck className="h-3 w-3 text-[#FFB4A2]" aria-hidden />
          <span className="flex">
            Escrow
            <span className="hidden max-w-0 overflow-hidden whitespace-pre transition-[max-width] duration-500 group-hover:max-w-[70px] sm:inline">
              {" protected"}
            </span>
          </span>
        </span>
      </div>

      {/* Outside the stretched link's stacking order, so it is its own control */}
      <button
        type="button"
        onClick={handleWishlist}
        className={cn(
          "absolute right-3 top-3 z-20 grid h-8 w-8 place-items-center rounded-full backdrop-blur-md transition-all sm:right-4 sm:top-4",
          wishlisted
            ? "bg-white text-[#E0483B] shadow-md"
            : "bg-black/30 text-white hover:bg-white hover:text-[#E0483B]",
        )}
        aria-label={wishlisted ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
        aria-pressed={wishlisted}
      >
        <Heart className={cn("h-4 w-4", wishlisted && "fill-current")} aria-hidden="true" />
      </button>

      {/* Details */}
      <div className="flex flex-1 flex-col px-1.5 pb-1.5 pt-3 sm:px-2 sm:pb-2 sm:pt-3.5">
        <div className="flex items-center justify-between gap-2 text-[11px]">
          <Link
            href={`/seller/${product.sellerId}`}
            className="relative z-10 min-w-0 truncate font-semibold text-ink-muted underline-offset-2 transition-colors hover:text-accent hover:underline"
          >
            {product.seller}
          </Link>
          {product.reviewCount > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-ink-muted">
              <Star className="h-3 w-3 fill-[#F5A25D] text-[#F5A25D]" aria-hidden="true" />
              <span className="tnum font-semibold text-ink">{product.rating.toFixed(1)}</span>
              <span className="tnum hidden text-ink-faint sm:inline">({product.reviewCount})</span>
            </span>
          )}
        </div>

        <h3 className="mb-3 mt-1 line-clamp-2 min-h-[2.6em] text-[14px] font-medium leading-[1.3] text-ink sm:text-[15px]">
          <Link
            href={`/product/${product.id}`}
            className="outline-none after:absolute after:inset-0 after:z-0 after:rounded-[22px] focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-[var(--accent)]"
          >
            {product.name}
          </Link>
        </h3>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-dashed border-line pt-3">
          <PriceTag
            xlm={product.xlmPrice}
            usd={product.usdPrice}
            originalUsd={discounted ? product.originalUsdPrice : undefined}
            size="sm"
          />
          <span
            aria-hidden
            className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-ink transition-all duration-500 group-hover:bg-linear-to-br group-hover:from-[#E0483B] group-hover:to-[#FF7A59] group-hover:text-white sm:grid"
          >
            <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:rotate-45" />
          </span>
        </div>
      </div>
    </article>
  );
}

const BADGES = {
  flash: "Deal",
  hot: "Trending",
  new: "New",
} as const;

function Badge({ badge }: { badge: "flash" | "hot" | "new" }) {
  return (
    <span className="rounded-full bg-[#14151C]/80 px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-white backdrop-blur-md">
      {BADGES[badge]}
    </span>
  );
}
