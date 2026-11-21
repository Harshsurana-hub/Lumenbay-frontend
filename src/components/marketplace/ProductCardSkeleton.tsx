/** Placeholder with the same proportions as `ProductCard`, so nothing jumps when listings land. */
export default function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col rounded-[22px] border border-line bg-surface p-1.5 sm:p-2" aria-hidden="true">
      <div className="lb-skeleton aspect-[4/5] rounded-[16px]" />
      <div className="px-1.5 pb-1.5 pt-3 sm:px-2 sm:pb-2 sm:pt-3.5">
        <div className="lb-skeleton h-2.5 w-1/3 rounded-full" />
        <div className="lb-skeleton mt-2.5 h-3.5 w-11/12 rounded-full" />
        <div className="lb-skeleton mt-2 h-3.5 w-2/3 rounded-full" />
        <div className="mt-4 flex items-end justify-between border-t border-dashed border-line pt-3">
          <div>
            <div className="lb-skeleton h-5 w-24 rounded-md" />
            <div className="lb-skeleton mt-2 h-2.5 w-16 rounded-full" />
          </div>
          <div className="lb-skeleton hidden h-9 w-9 rounded-full sm:block" />
        </div>
      </div>
    </div>
  );
}
