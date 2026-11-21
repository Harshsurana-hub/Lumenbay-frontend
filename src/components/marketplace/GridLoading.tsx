import ProductCardSkeleton from "@/components/marketplace/ProductCardSkeleton";

/** Route-level loading state for pages that show a grid of listings. */
export default function GridLoading({ title }: { title?: string }) {
  return (
    <div className="min-h-screen bg-bg" aria-busy="true" aria-label="Loading">
      <div className="mx-auto max-w-7xl px-4 pt-28">
        {title ? (
          <p className="mb-4 text-base font-black text-ink">{title}</p>
        ) : (
          <div className="mb-6 h-40 animate-pulse rounded-2xl bg-surface-2" />
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
