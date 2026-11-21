import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import type { Product } from "@/lib/products";
import ProductCard from "@/components/marketplace/ProductCard";
import { XlmAmount } from "@/components/shop/PriceTag";
import ListingPlaceholder from "@/components/shop/ListingPlaceholder";
import { formatUsd } from "@/lib/money";

/**
 * Listings currently below their original price, deepest cut first.
 *
 * This replaces the "Flash Sale", whose countdown was a timer started on the
 * visitor's first page load and tied to nothing. A markdown here is one a
 * seller actually set; there is no clock because no sale ends.
 */
export default function PriceDrops({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  if (products.length < 3) {
    return (
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    );
  }

  const [lead, ...rest] = products;

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <li className="col-span-2 lg:row-span-2">
        <FeatureListingCard product={lead} />
      </li>
      {rest.slice(0, 4).map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

/** A listing given the full width of the bento: photograph edge to edge, details over it. */
function FeatureListingCard({ product }: { product: Product }) {
  const cover = product.images?.[0];
  const saving = product.originalUsdPrice - product.usdPrice;
  const percent =
    product.discountPercent > 0
      ? product.discountPercent
      : Math.round((saving / product.originalUsdPrice) * 100);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group relative flex h-full min-h-[420px] overflow-hidden rounded-[28px] border border-line bg-[#120B0A] sm:min-h-[520px]"
    >
      {cover ? (
        <Image
          src={cover}
          alt=""
          fill
          sizes="(max-width: 1024px) 100vw, 640px"
          className="object-cover transition-transform duration-[1400ms] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-105"
        />
      ) : (
        <ListingPlaceholder seed={product.id} category={product.category} size="hero" className="absolute inset-0" />
      )}
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-black/10" />

      <div className="relative flex w-full flex-col justify-between p-5 sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#B2271B]">
            Save {formatUsd(saving)} · −{percent}%
          </span>
          <span className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-white/10 text-white backdrop-blur-md transition-all duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-[#1A0907]">
            <ArrowUpRight className="h-5 w-5" aria-hidden />
          </span>
        </div>

        <div className="text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            Deepest cut · {product.category}
          </p>
          <p className="font-display mt-2 max-w-md text-[26px] font-bold leading-[1.05] tracking-[-0.02em] sm:text-[34px]">
            {product.name}
          </p>
          <div className="mt-5 flex flex-wrap items-end gap-x-5 gap-y-2">
            <XlmAmount amount={product.xlmPrice} size="lg" tone="light" />
            <p className="tnum pb-1 text-sm text-white/60">
              ≈ {formatUsd(product.usdPrice)}{" "}
              <s className="text-white/40">{formatUsd(product.originalUsdPrice)}</s>
            </p>
          </div>
          <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-white/70">
            <ShieldCheck className="h-3.5 w-3.5 text-[#FFB4A2]" aria-hidden />
            Sold by {product.seller}, paid through escrow
          </p>
        </div>
      </div>
    </Link>
  );
}
