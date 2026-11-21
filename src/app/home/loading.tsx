import ProductCardSkeleton from "@/components/marketplace/ProductCardSkeleton";

/** The home page's shape while the catalogue loads: the vault masthead, the index, the first rail. */
export default function Loading() {
  return (
    <div className="min-h-screen bg-bg" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-[1360px] px-4 pt-[108px] sm:px-6">
        <div className="lb-vault lb-grain relative overflow-hidden rounded-[28px] sm:rounded-[36px]">
          <div className="grid items-center gap-10 px-5 py-10 sm:px-10 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-14 lg:py-16">
            <div className="space-y-4">
              <div className="h-7 w-40 animate-pulse rounded-full bg-white/10" />
              <div className="h-14 w-11/12 animate-pulse rounded-2xl bg-white/10 sm:h-20" />
              <div className="h-14 w-3/4 animate-pulse rounded-2xl bg-[#FF7A59]/20 sm:h-20" />
              <div className="h-4 w-2/3 animate-pulse rounded-full bg-white/10" />
              <div className="flex gap-3 pt-4">
                <div className="h-12 w-52 animate-pulse rounded-full bg-white/20" />
                <div className="h-12 w-44 animate-pulse rounded-full bg-white/10" />
              </div>
            </div>
            <div className="mx-auto aspect-[4/5] w-full max-w-[360px] animate-pulse rounded-[28px] border border-white/10 bg-white/[0.06]" />
          </div>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-3 sm:mt-24 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="lb-skeleton h-[148px] rounded-[22px] sm:h-[168px]" />
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 gap-3 sm:mt-24 sm:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
      <span className="sr-only" role="status">
        Loading the marketplace
      </span>
    </div>
  );
}
