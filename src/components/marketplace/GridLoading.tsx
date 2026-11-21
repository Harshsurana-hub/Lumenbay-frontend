import ProductCardSkeleton from "@/components/marketplace/ProductCardSkeleton";

/** Route-level loading state for pages that show a masthead over a grid of listings. */
export default function GridLoading({ title }: { title?: string }) {
  return (
    <div className="min-h-screen bg-bg" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-[1360px] px-4 pt-[108px] sm:px-6">
        <div className="relative overflow-hidden rounded-[28px] border border-line bg-surface px-5 py-8 sm:rounded-[36px] sm:px-10 sm:py-10">
          <div aria-hidden className="lb-dots pointer-events-none absolute inset-0 text-line" />
          <div className="relative">
            {title ? (
              <>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-accent">{title}</p>
                <div className="lb-skeleton mt-3 h-12 w-72 max-w-full rounded-2xl sm:h-16 sm:w-[28rem]" />
              </>
            ) : (
              <>
                <div className="lb-skeleton h-3 w-24 rounded-full" />
                <div className="lb-skeleton mt-4 h-12 w-72 max-w-full rounded-2xl sm:h-16 sm:w-[28rem]" />
              </>
            )}
            <div className="lb-skeleton mt-5 h-3.5 w-64 max-w-full rounded-full" />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <span className="sr-only" role="status">
        Loading listings
      </span>
    </div>
  );
}
