import { toneFor } from "@/lib/shopDisplay";
import CategoryIcon from "./CategoryIcon";
import { cn } from "@/lib/utils";

/**
 * What a listing shows when the seller has not uploaded a photograph.
 *
 * A grey box with "No photograph" in it reads as broken. This reads as a
 * cover: a warm gradient picked from the listing's id (so it never changes
 * between visits), the category's mark sitting inside the same rings the
 * escrow vault uses on the landing page, and the category named underneath.
 * Colours are fixed rather than themed: it is artwork, not chrome.
 */
export default function ListingPlaceholder({
  seed,
  category,
  size = "card",
  showLabel = true,
  className,
}: {
  seed: string;
  category: string;
  size?: "card" | "hero";
  /** Off for tiny tiles, where the category name would not fit. */
  showLabel?: boolean;
  className?: string;
}) {
  const { from, to } = toneFor(seed);
  const hero = size === "hero";

  return (
    <div
      className={cn("lb-grain relative flex h-full w-full items-center justify-center overflow-hidden", className)}
      style={{ background: `radial-gradient(120% 90% at 80% 10%, ${to} 0%, ${from} 62%)` }}
      role="img"
      aria-label={`${category} listing without a photograph`}
    >
      <div aria-hidden className="lb-dots absolute inset-0 text-white/[0.12]" />
      <div
        aria-hidden
        className={cn(
          "absolute rounded-full border border-white/15",
          hero ? "h-[78%] w-[78%]" : "h-[86%] w-[86%]",
        )}
      />
      <div
        aria-hidden
        className={cn(
          "absolute rounded-full border border-dashed border-white/20",
          hero ? "h-[54%] w-[54%]" : "h-[60%] w-[60%]",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "relative grid place-items-center border border-white/25 bg-white/10 text-white shadow-[0_20px_50px_-15px_rgba(0,0,0,0.6)] backdrop-blur-md",
          hero ? "h-28 w-28 rounded-[28px]" : "h-14 w-14 rounded-2xl",
        )}
      >
        <CategoryIcon category={category} className={hero ? "h-12 w-12" : "h-6 w-6"} strokeWidth={1.5} />
      </span>
      {showLabel && (
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-4 top-1/2 truncate text-center font-bold uppercase text-white/75",
            hero ? "mt-20 text-xs tracking-[0.3em]" : "mt-11 text-[9px] tracking-[0.25em]",
          )}
        >
          {category}
        </span>
      )}
    </div>
  );
}
