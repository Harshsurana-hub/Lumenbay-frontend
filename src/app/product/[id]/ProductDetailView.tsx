"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Lock,
  MessageCircle,
  Share2,
  Shield,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { Product } from "@/lib/products";
import BuyWithEscrowDialog from "@/components/escrow/BuyWithEscrowDialog";
import ProductCard from "@/components/marketplace/ProductCard";
import PriceTag, { XlmAmount } from "@/components/shop/PriceTag";
import ListingPlaceholder from "@/components/shop/ListingPlaceholder";
import EscrowJourney from "@/components/shop/EscrowJourney";
import { isWishlisted, toggleWishlist } from "@/lib/wishlistStore";
import { formatUsd } from "@/lib/money";
import { initialsOf, splitAmount, toneFor } from "@/lib/shopDisplay";
import { cn } from "@/lib/utils";

const BADGE_LABELS = { flash: "Deal", hot: "Trending", new: "New" } as const;

export default function ProductDetailView({
  product,
  images,
  hasImages,
  related,
}: {
  product: Product;
  images: string[];
  hasImages: boolean;
  related: Product[];
}) {
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [buying, setBuying] = useState(false);
  const [shared, setShared] = useState(false);

  // The heart used to be local state only, so saving here never reached the
  // wishlist page. It now shares the store the product cards use.
  useEffect(() => {
    const update = () => setWishlisted(isWishlisted(product.id));
    update();
    window.addEventListener("wishlist-change", update);
    return () => window.removeEventListener("wishlist-change", update);
  }, [product.id]);

  const discountSaving = product.originalUsdPrice - product.usdPrice;
  const discounted = discountSaving > 0;
  const percent =
    product.discountPercent > 0
      ? product.discountPercent
      : discounted
        ? Math.round((discountSaving / product.originalUsdPrice) * 100)
        : 0;

  const showImage = (index: number) => setActiveImg((index + images.length) % images.length);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* the user dismissed the share sheet */
    }
  }

  const sellerTone = toneFor(product.sellerId);
  const hasSellerRecord = (product.sellerSales ?? 0) > 0;
  const xlmParts = splitAmount(product.xlmPrice);

  return (
    <div className="min-h-screen bg-bg pb-28 lg:pb-0">
      <div className="mx-auto max-w-[1360px] px-4 pt-[108px] sm:px-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between gap-4">
          <nav aria-label="Breadcrumb" className="min-w-0">
            <ol className="flex min-w-0 items-center gap-2 text-xs text-ink-faint">
              <li>
                <Link href="/home" className="inline-flex items-center gap-1.5 font-semibold text-ink-muted transition-colors hover:text-accent">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  Discover
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li>
                <Link
                  href={`/home?category=${encodeURIComponent(product.category)}`}
                  className="transition-colors hover:text-accent"
                >
                  {product.category}
                </Link>
              </li>
              <li aria-hidden className="hidden sm:block">/</li>
              <li className="hidden min-w-0 truncate text-ink-muted sm:block" aria-current="page">
                {product.name}
              </li>
            </ol>
          </nav>
        </div>

        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:grid-rows-[auto_1fr] lg:gap-x-12 xl:gap-x-16">
          {/* ── Gallery ── */}
          <div className="min-w-0">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-[28px] border border-line bg-surface-2 sm:aspect-square sm:rounded-[36px]">
              {hasImages ? (
                <Image
                  key={images[activeImg]}
                  src={images[activeImg]}
                  alt={`${product.name} — photograph ${activeImg + 1} of ${images.length}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 760px"
                  className="object-cover"
                  priority
                />
              ) : (
                <ListingPlaceholder seed={product.id} category={product.category} size="hero" />
              )}

              {(percent > 0 || product.badge) && (
                <div className="absolute left-4 top-4 flex flex-wrap gap-1.5 sm:left-5 sm:top-5">
                  {percent > 0 && (
                    <span className="tnum rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#B2271B] shadow-sm backdrop-blur-md">
                      −{percent}%
                    </span>
                  )}
                  {product.badge && (
                    <span className="rounded-full bg-[#14151C]/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md">
                      {BADGE_LABELS[product.badge]}
                    </span>
                  )}
                </div>
              )}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => showImage(activeImg - 1)}
                    aria-label="Previous photograph"
                    className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-[#14151C] shadow-md backdrop-blur-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => showImage(activeImg + 1)}
                    aria-label="Next photograph"
                    className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-[#14151C] shadow-md backdrop-blur-md transition hover:bg-white sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden />
                  </button>
                  <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-2 backdrop-blur-md" aria-hidden>
                    {images.map((url, i) => (
                      <span
                        key={url}
                        className={cn("h-1.5 rounded-full transition-all", i === activeImg ? "w-5 bg-white" : "w-1.5 bg-white/50")}
                      />
                    ))}
                  </div>
                </>
              )}

              <span className="absolute bottom-4 right-4 hidden items-center gap-1.5 rounded-full border border-white/20 bg-black/40 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md sm:inline-flex">
                <ShieldCheck className="h-3.5 w-3.5 text-[#FFB4A2]" aria-hidden />
                Escrow protected
              </span>
            </div>

            {images.length > 1 && (
              <div className="lb-rail mt-3 flex gap-2.5 overflow-x-auto">
                {images.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveImg(i)}
                    aria-label={`Show photograph ${i + 1}`}
                    aria-current={activeImg === i}
                    className={cn(
                      "relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 bg-surface-2 transition-all",
                      activeImg === i ? "border-accent" : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image src={url} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Purchase panel ── */}
          <div className="min-w-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <div className="lg:sticky lg:top-[120px]">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={`/home?category=${encodeURIComponent(product.category)}`}
                  className="rounded-full border border-accent-line bg-accent-soft px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent transition-colors hover:border-accent"
                >
                  {product.category}
                </Link>
                {product.reviewCount > 0 ? (
                  <span className="flex items-center gap-1.5 text-sm">
                    <span className="flex items-center gap-0.5" aria-hidden>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "h-3.5 w-3.5",
                            star <= Math.round(product.rating) ? "fill-[#F5A25D] text-[#F5A25D]" : "fill-line text-line",
                          )}
                        />
                      ))}
                    </span>
                    <span className="tnum font-semibold text-ink">{product.rating.toFixed(1)}</span>
                    <span className="tnum text-ink-faint">
                      ({product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"})
                    </span>
                  </span>
                ) : (
                  <span className="text-xs text-ink-faint">No reviews yet</span>
                )}
              </div>

              <h1 className="font-display mt-4 text-[32px] font-bold leading-[1.02] tracking-[-0.03em] text-ink sm:text-[44px]">
                {product.name}
              </h1>

              <p className="mt-3 text-sm text-ink-muted">
                Sold by{" "}
                <Link
                  href={`/seller/${product.sellerId}`}
                  className="font-semibold text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
                >
                  {product.seller}
                </Link>
              </p>

              {/* Price + action */}
              <div className="relative mt-6 overflow-hidden rounded-[28px] border border-line bg-surface p-5 shadow-panel sm:p-6">
                <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-soft blur-2xl" />
                <div className="relative">
                  <div className="flex items-start justify-between gap-3">
                    <p className="label">You pay</p>
                    {discounted && (
                      <span className="tnum rounded-full bg-deal-bg px-2.5 py-1 text-xs font-bold text-deal">
                        You save {formatUsd(discountSaving)}
                      </span>
                    )}
                  </div>
                  <PriceTag
                    className="mt-2"
                    xlm={product.xlmPrice}
                    usd={product.usdPrice}
                    originalUsd={discounted ? product.originalUsdPrice : undefined}
                    size="xl"
                  />

                  <div className="mt-6 flex gap-2.5">
                    <button
                      type="button"
                      onClick={() => setBuying(true)}
                      className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-linear-to-r from-[#E0483B] to-[#FF7A59] py-4 text-[15px] font-bold text-white shadow-[0_14px_30px_-12px_rgba(224,72,59,0.8)] transition hover:brightness-110"
                    >
                      <span className="lb-sheen absolute inset-0 opacity-40" aria-hidden />
                      <Shield className="h-4 w-4" aria-hidden />
                      Buy with escrow
                    </button>
                    <button
                      type="button"
                      onClick={() => setWishlisted(toggleWishlist(product.id))}
                      aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                      aria-pressed={wishlisted}
                      className={cn(
                        "grid w-14 shrink-0 place-items-center rounded-2xl border transition-colors",
                        wishlisted
                          ? "border-accent-line bg-accent-soft text-accent"
                          : "border-line-strong text-ink-muted hover:border-ink hover:text-ink",
                      )}
                    >
                      <Heart className={cn("h-5 w-5", wishlisted && "fill-current")} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={share}
                      aria-label={shared ? "Link copied" : "Share this listing"}
                      className="grid w-14 shrink-0 place-items-center rounded-2xl border border-line-strong text-ink-muted transition-colors hover:border-ink hover:text-ink"
                    >
                      {shared ? <Check className="h-5 w-5 text-ok" aria-hidden /> : <Share2 className="h-5 w-5" aria-hidden />}
                    </button>
                  </div>
                  <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-ink-muted">
                    <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" aria-hidden />
                    Your XLM goes into a Stellar smart contract, not to the seller and not to us, and
                    is only released when you confirm the item arrived.
                  </p>
                  <span className="sr-only" role="status">
                    {shared ? "Link copied to clipboard" : ""}
                  </span>
                </div>
              </div>

              {/* Escrow explainer */}
              <div className="mt-4 rounded-[28px] border border-line bg-surface p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between gap-3">
                  <p className="font-display text-lg font-bold text-ink">How this purchase is protected</p>
                  <ShieldCheck className="h-5 w-5 shrink-0 text-accent" aria-hidden />
                </div>
                <EscrowJourney variant="panel" amount={`${xlmParts.whole}${xlmParts.fraction} XLM`} />
              </div>

              {/* Seller */}
              <div className="mt-4 rounded-[28px] border border-line bg-surface p-5 sm:p-6">
                <div className="flex items-center gap-3.5">
                  <span
                    className="font-display grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${sellerTone.to}, ${sellerTone.from})` }}
                    aria-hidden
                  >
                    {initialsOf(product.seller)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="label">Seller</p>
                    <Link
                      href={`/seller/${product.sellerId}`}
                      className="mt-0.5 block truncate font-semibold text-ink hover:text-accent"
                    >
                      {product.seller}
                    </Link>
                    <p className="tnum mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                      {hasSellerRecord ? (
                        <>
                          <Star className="h-3 w-3 fill-[#F5A25D] text-[#F5A25D]" aria-hidden />
                          <span className="font-semibold text-ink">{(product.sellerRating ?? 0).toFixed(1)}</span>
                          <span aria-hidden>·</span>
                          {(product.sellerSales ?? 0).toLocaleString()} completed sales
                        </>
                      ) : (
                        "New seller, no completed sales yet"
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    href={`/seller/${product.sellerId}`}
                    className="flex items-center justify-center gap-1.5 rounded-xl bg-ink py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
                  >
                    Visit shop
                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                  </Link>
                  <button
                    type="button"
                    disabled
                    title="Messaging between buyers and sellers is not built yet"
                    className="flex cursor-not-allowed items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 text-sm font-semibold text-ink-faint"
                  >
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    Contact — soon
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── About ── */}
          <div className="min-w-0 lg:col-start-1 lg:row-start-2">
            <section className="border-t border-line pt-8 lg:mt-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">About this item</p>
              {product.description ? (
                <p className="mt-4 max-w-2xl whitespace-pre-line text-[17px] leading-[1.7] text-ink">
                  {product.description}
                </p>
              ) : (
                <p className="mt-4 text-sm text-ink-faint">The seller has not added a description.</p>
              )}

              <dl className="mt-8 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
                {[
                  ["Category", product.category],
                  ["Price in USD", formatUsd(product.usdPrice)],
                  ["Settlement", "Stellar escrow"],
                  ["Listing", product.id.slice(0, 8)],
                ].map(([term, detail]) => (
                  <div key={term} className="bg-surface px-4 py-3.5">
                    <dt className="label">{term}</dt>
                    <dd className={cn("mt-1 truncate text-sm font-semibold text-ink", term === "Listing" && "font-mono")}>
                      {detail}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          </div>
        </div>

        {/* ── Related ── */}
        {related.length > 0 && (
          <section className="mt-20 border-t border-line pt-12 sm:mt-28">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Keep looking</p>
                <h2 className="font-display mt-2 text-[28px] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
                  More in {product.category}
                </h2>
              </div>
              <Link
                href={`/home?category=${encodeURIComponent(product.category)}`}
                className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink"
              >
                View all
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </div>
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="h-16 sm:h-24" />
      </div>

      {/* Mobile purchase bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <XlmAmount amount={product.xlmPrice} size="sm" />
            <p className="tnum mt-0.5 text-[11px] text-ink-muted">≈ {formatUsd(product.usdPrice)}</p>
          </div>
          <button
            type="button"
            onClick={() => setBuying(true)}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-linear-to-r from-[#E0483B] to-[#FF7A59] px-5 py-3.5 text-sm font-bold text-white shadow-[0_10px_24px_-10px_rgba(224,72,59,0.8)]"
          >
            <Shield className="h-4 w-4" aria-hidden />
            Buy with escrow
          </button>
        </div>
      </div>

      {buying && <BuyWithEscrowDialog product={product} onClose={() => setBuying(false)} />}
    </div>
  );
}
