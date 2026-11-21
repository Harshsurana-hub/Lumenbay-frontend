import ProductCardSkeleton from "./ProductCardSkeleton";

/**
 * Shown while the marketplace query runs.
 *
 * Mirrors the real page — masthead, toolbar, filters, three-column grid — so
 * the layout does not jump when the listings land.
 */
export default function MarketplaceLoadingState() {
  return (
    <section className="mx-auto w-full max-w-[1360px] px-4 pb-16 sm:px-6" aria-busy="true">
      <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface px-5 py-7 sm:rounded-[36px] sm:px-10 sm:py-10">
        <div aria-hidden className="lb-dots pointer-events-none absolute inset-0 text-line" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">Marketplace</p>
            <div className="lb-skeleton mt-3 h-12 w-72 max-w-full rounded-2xl sm:h-16 sm:w-[30rem]" />
            <div className="lb-skeleton mt-5 h-3.5 w-60 max-w-full rounded-full" />
          </div>
          <div className="lb-skeleton h-12 w-full rounded-full lg:w-96" />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-b border-line py-3">
        <div className="lb-skeleton h-9 w-28 rounded-full lg:w-48" />
        <div className="lb-skeleton h-9 w-36 rounded-full md:w-80" />
      </div>

      <div className="mt-6 flex gap-8">
        <div className="hidden w-64 shrink-0 lg:block">
          <div className="space-y-3 rounded-[22px] border border-line bg-surface p-5">
            <div className="lb-skeleton h-5 w-24 rounded-full" />
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="lb-skeleton h-8 rounded-xl" />
            ))}
            <div className="lb-skeleton h-11 rounded-xl" />
          </div>
        </div>

        <ul className="grid min-w-0 flex-1 grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <li key={index}>
              <ProductCardSkeleton />
            </li>
          ))}
        </ul>
      </div>

      <span className="sr-only" role="status">
        Loading listings
      </span>
    </section>
  );
}
