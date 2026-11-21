export default function Loading() {
  return (
    <div className="min-h-screen bg-bg" aria-busy="true" aria-label="Loading listing">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 pt-28 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-surface-2" />
        <div className="flex flex-col gap-4">
          <div className="h-5 w-24 animate-pulse rounded-full bg-surface-2" />
          <div className="h-8 w-3/4 animate-pulse rounded-lg bg-surface-2" />
          <div className="h-24 animate-pulse rounded-xl bg-surface-2" />
          <div className="h-14 animate-pulse rounded-xl bg-surface-2" />
          <div className="h-12 animate-pulse rounded-xl bg-surface-3" />
        </div>
      </div>
    </div>
  );
}
