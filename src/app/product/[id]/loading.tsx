/** Mirrors the listing page: gallery on the left, the sticky purchase panel on the right. */
export default function Loading() {
  return (
    <div className="min-h-screen bg-bg" aria-busy="true" aria-label="Loading listing">
      <div className="mx-auto max-w-[1360px] px-4 pt-[108px] sm:px-6">
        <div className="lb-skeleton h-3 w-40 rounded-full" />
        <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:gap-x-12 xl:gap-x-16">
          <div>
            <div className="lb-skeleton aspect-[4/5] rounded-[28px] sm:aspect-square sm:rounded-[36px]" />
            <div className="mt-3 flex gap-2.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="lb-skeleton h-20 w-20 rounded-2xl" />
              ))}
            </div>
          </div>
          <div>
            <div className="lb-skeleton h-6 w-28 rounded-full" />
            <div className="lb-skeleton mt-4 h-10 w-11/12 rounded-2xl sm:h-12" />
            <div className="lb-skeleton mt-2 h-10 w-2/3 rounded-2xl sm:h-12" />
            <div className="lb-skeleton mt-4 h-3.5 w-40 rounded-full" />
            <div className="mt-6 rounded-[28px] border border-line bg-surface p-5 sm:p-6">
              <div className="lb-skeleton h-3 w-16 rounded-full" />
              <div className="lb-skeleton mt-3 h-12 w-56 rounded-2xl" />
              <div className="lb-skeleton mt-3 h-3.5 w-28 rounded-full" />
              <div className="mt-6 flex gap-2.5">
                <div className="lb-skeleton h-14 flex-1 rounded-2xl" />
                <div className="lb-skeleton h-14 w-14 rounded-2xl" />
                <div className="lb-skeleton h-14 w-14 rounded-2xl" />
              </div>
            </div>
            <div className="mt-4 space-y-4 rounded-[28px] border border-line bg-surface p-5 sm:p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-3.5">
                  <div className="lb-skeleton h-8 w-8 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="lb-skeleton h-3.5 w-1/2 rounded-full" />
                    <div className="lb-skeleton h-3 w-5/6 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <span className="sr-only" role="status">
        Loading listing
      </span>
    </div>
  );
}
