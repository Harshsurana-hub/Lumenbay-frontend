import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Lock } from "lucide-react";
import type { Product } from "@/lib/products";
import { XlmAmount } from "@/components/shop/PriceTag";
import ListingPlaceholder from "@/components/shop/ListingPlaceholder";
import { formatUsd } from "@/lib/money";

/**
 * The masthead of the marketplace.
 *
 * A fixed-dark "vault" panel in both themes, carrying the landing page's
 * ember glow into the shop. The right side is not a stock banner: it is the
 * newest real listing, fanned over the two before it, so the first thing a
 * buyer sees is something they can actually buy.
 */
export default function HomeHero({
  featured,
  supporting,
  liveCount,
}: {
  featured: Product | null;
  supporting: Product[];
  liveCount: number;
}) {
  return (
    <section className="lb-vault lb-grain relative isolate overflow-hidden rounded-[28px] sm:rounded-[36px]">
      <div aria-hidden className="lb-dots pointer-events-none absolute inset-0 text-white/[0.05]" />
      <div aria-hidden className="lb-edge-glow absolute inset-x-16 top-0 h-px" />
      <div
        aria-hidden
        className="lb-drift-a pointer-events-none absolute -right-20 top-1/4 h-[26rem] w-[26rem] rounded-full bg-[#E0483B] opacity-25 blur-[110px]"
      />

      <div className="relative grid items-center gap-10 px-5 pb-8 pt-9 sm:px-10 sm:pb-12 sm:pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6 lg:px-14 lg:py-16">
        {/* Copy */}
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#FFD8CC] backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF7A59] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#FF7A59]" />
            </span>
            {liveCount > 0
              ? `${liveCount.toLocaleString()} ${liveCount === 1 ? "listing" : "listings"} live`
              : "The marketplace is open"}
          </p>

          <h1 className="font-display mt-6 text-[44px] font-bold leading-[0.95] tracking-[-0.035em] sm:text-[64px] lg:text-[76px]">
            Buy from strangers.
            <br />
            <span className="lb-ember-text">Trust the contract.</span>
          </h1>

          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-white/65 sm:text-base">
            Every payment on Lumenbay waits in a Stellar smart contract until you confirm the item
            arrived. Not with us. Not with the seller.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/marketplace"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#1A0907] shadow-[0_0_40px_rgba(255,122,89,0.45)] transition hover:shadow-[0_0_60px_rgba(255,180,150,0.6)]"
            >
              <span className="lb-sheen absolute inset-0" aria-hidden />
              Browse the marketplace
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </Link>
            <a
              href="#escrow"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white backdrop-blur transition hover:border-white/40 hover:bg-white/10"
            >
              <Lock className="h-4 w-4 text-[#FFB4A2]" aria-hidden />
              How escrow works
            </a>
          </div>

          {/* The deal in one line */}
          <ol className="mt-10 flex max-w-lg items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">
            {["Pay", "Lock", "Ship", "Release"].map((step, i) => (
              <li key={step} className="flex flex-1 items-center gap-2 last:flex-none">
                <span className={i === 1 ? "text-[#FFB4A2]" : undefined}>{step}</span>
                {i < 3 && <span aria-hidden className="lb-flow-line h-px flex-1 text-white/30" />}
              </li>
            ))}
          </ol>
        </div>

        {/* Showcase */}
        <div className="relative mx-auto w-full max-w-[440px] lg:mr-0">
          <div
            aria-hidden
            className="lb-breathe pointer-events-none absolute inset-8 rounded-full bg-[radial-gradient(circle,rgba(255,122,89,0.55),transparent_65%)] blur-2xl"
          />
          {supporting.slice(0, 2).map((product, i) => (
            <div
              key={product.id}
              aria-hidden
              className={
                i === 0
                  ? "absolute -left-10 top-10 hidden aspect-[4/5] w-[46%] -rotate-[8deg] overflow-hidden rounded-[22px] border border-white/15 opacity-80 shadow-2xl sm:block"
                  : "absolute -right-8 bottom-16 hidden aspect-[4/5] w-[40%] rotate-[7deg] overflow-hidden rounded-[22px] border border-white/15 opacity-70 shadow-2xl sm:block"
              }
            >
              {product.images?.[0] ? (
                <Image src={product.images[0]} alt="" fill sizes="200px" className="object-cover" />
              ) : (
                <ListingPlaceholder seed={product.id} category={product.category} />
              )}
            </div>
          ))}

          {featured ? (
            <Link
              href={`/product/${featured.id}`}
              className="group relative block overflow-hidden rounded-[28px] border border-white/15 bg-[#120B0A] p-2 shadow-[0_40px_100px_-30px_rgba(224,72,59,0.7)] transition-transform duration-700 ease-[cubic-bezier(.2,.7,.2,1)] hover:-translate-y-1.5 sm:mx-10"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
                {featured.images?.[0] ? (
                  <Image
                    src={featured.images[0]}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 380px"
                    className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105"
                  />
                ) : (
                  <ListingPlaceholder seed={featured.id} category={featured.category} size="hero" />
                )}
                <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#1A0907]">
                  Just listed
                </span>

                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                    {featured.category} · {featured.seller}
                  </p>
                  <p className="font-display mt-1.5 line-clamp-2 text-xl font-bold leading-tight text-white sm:text-2xl">
                    {featured.name}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <XlmAmount amount={featured.xlmPrice} size="md" tone="light" />
                      <p className="tnum mt-1 text-xs text-white/55">≈ {formatUsd(featured.usdPrice)}</p>
                    </div>
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-[#1A0907] transition-transform duration-500 group-hover:rotate-45">
                      <ArrowUpRight className="h-5 w-5" aria-hidden />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            <div className="relative overflow-hidden rounded-[28px] border border-white/15 p-2 sm:mx-10">
              <div className="aspect-[4/5] overflow-hidden rounded-[22px]">
                <ListingPlaceholder seed="lumenbay" category="Your listing here" size="hero" />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
