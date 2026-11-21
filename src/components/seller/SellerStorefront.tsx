import Image from "next/image";
import Link from "next/link";
import { CalendarDays, ShieldCheck, Star, Store } from "lucide-react";
import type { SellerProfile } from "@/lib/listings";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/marketplace/ProductCard";
import { initialsOf, toneFor } from "@/lib/shopDisplay";

/**
 * A seller's shopfront.
 *
 * Laid out like a shop sign over a window: a warm banner tinted from the
 * seller's id, their mark overlapping it, the facts a buyer weighs before
 * paying a stranger, and then everything they have for sale.
 */
export default function SellerStorefront({
  seller,
  listings,
}: {
  seller: SellerProfile;
  listings: Product[];
}) {
  const { from, to } = toneFor(seller.id);
  const memberSince = new Date(seller.memberSince).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const hasRecord = seller.sellerSales > 0 || seller.sellerRating > 0;

  const stats: { label: string; value: string; icon: typeof Star }[] = [
    ...(hasRecord
      ? [
          { label: "Rating", value: seller.sellerRating.toFixed(1), icon: Star },
          { label: "Completed sales", value: seller.sellerSales.toLocaleString(), icon: ShieldCheck },
        ]
      : []),
    { label: listings.length === 1 ? "Live listing" : "Live listings", value: listings.length.toLocaleString(), icon: Store },
    { label: "Member since", value: memberSince, icon: CalendarDays },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <div className="mx-auto max-w-[1360px] px-4 pb-24 pt-[108px] sm:px-6">
        <header className="overflow-hidden rounded-[28px] border border-line bg-surface sm:rounded-[36px]">
          {/* Banner */}
          <div
            className="lb-grain relative h-36 sm:h-52"
            style={{ background: `radial-gradient(120% 140% at 85% 0%, ${to} 0%, ${from} 70%)` }}
          >
            <div aria-hidden className="lb-dots absolute inset-0 text-white/10" />
            <p
              aria-hidden
              className="font-display pointer-events-none absolute -bottom-4 right-4 select-none whitespace-nowrap text-[64px] font-extrabold leading-none tracking-[-0.05em] text-white/10 sm:-bottom-6 sm:text-[120px]"
            >
              {seller.displayName}
            </p>
          </div>

          <div className="relative px-5 pb-6 sm:px-10 sm:pb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-end">
                <div className="relative -mt-12 h-24 w-24 shrink-0 overflow-hidden rounded-[28px] border-4 border-surface bg-surface-2 shadow-panel sm:-mt-16 sm:h-32 sm:w-32 sm:rounded-[36px]">
                  {seller.avatarUrl ? (
                    <Image src={seller.avatarUrl} alt="" fill sizes="128px" className="object-cover" />
                  ) : (
                    <div
                      className="font-display grid h-full place-items-center text-3xl font-bold text-white sm:text-4xl"
                      style={{ background: `linear-gradient(135deg, ${to}, ${from})` }}
                    >
                      {initialsOf(seller.displayName)}
                    </div>
                  )}
                </div>
                <div className="min-w-0 sm:pb-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
                    {hasRecord ? "Shop" : "New shop"}
                  </p>
                  <h1 className="font-display mt-1 break-words text-[34px] font-bold leading-none tracking-[-0.03em] text-ink sm:text-[48px]">
                    {seller.displayName}
                  </h1>
                </div>
              </div>

              {/* The one thing a buyer most wants to know about a stranger:
                  that they cannot simply take the money. */}
              <div className="flex items-start gap-3 rounded-2xl border border-accent-line bg-accent-soft p-4 lg:mt-6 lg:max-w-sm">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-linear-to-br from-[#E0483B] to-[#FF7A59] text-white">
                  <ShieldCheck className="h-4 w-4" aria-hidden />
                </span>
                <p className="text-xs leading-relaxed text-ink-muted">
                  <span className="block text-sm font-semibold text-ink">Paid through escrow</span>
                  {seller.stellarAddress
                    ? "Payouts settle to a verified Stellar account, and only after you confirm delivery."
                    : "Whatever you buy here stays locked in a smart contract until you confirm delivery."}
                </p>
              </div>
            </div>

            {seller.bio && <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{seller.bio}</p>}

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-4">
              {stats.map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-surface px-4 py-4">
                  <dt className="label flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {label}
                  </dt>
                  <dd className="font-display tnum mt-1.5 truncate text-xl font-bold text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </header>

        <section className="pt-12 sm:pt-16" aria-labelledby="shop-listings">
          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">In the window</p>
              <h2 id="shop-listings" className="font-display mt-2 text-[28px] font-bold tracking-[-0.02em] text-ink sm:text-[36px]">
                Everything from {seller.displayName}
              </h2>
            </div>
          </div>

          {listings.length === 0 ? (
            <div className="flex flex-col items-center rounded-[28px] border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-accent-soft text-accent">
                <Store className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="font-display mt-5 text-2xl font-bold text-ink">Nothing for sale right now</h3>
              <p className="mt-2 text-sm text-ink-muted">{seller.displayName} has no active listings.</p>
              <Link
                href="/marketplace"
                className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-bg transition-opacity hover:opacity-90"
              >
                Browse the marketplace
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {listings.map((listing, i) => (
                <li key={listing.id}>
                  <ProductCard product={listing} priority={i < 4} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
