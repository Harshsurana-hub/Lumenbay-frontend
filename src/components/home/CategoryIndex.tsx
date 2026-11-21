import Link from "next/link";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import { SHOP_CATEGORIES } from "@/lib/shopDisplay";

/**
 * Categories as a numbered index rather than a row of emoji.
 *
 * Each tile carries the number of live listings in it, counted from the
 * catalogue the page already loaded, so the figure is real and an empty
 * category says so instead of pretending.
 */
export default function CategoryIndex({
  counts,
  total,
}: {
  counts: Record<string, number>;
  total: number;
}) {
  const tiles = [
    ...SHOP_CATEGORIES.map((category) => ({
      key: category.value,
      label: category.label,
      icon: category.icon,
      href: `/home?category=${encodeURIComponent(category.value)}`,
      count: counts[category.value] ?? 0,
    })),
    { key: "all", label: "Everything", icon: LayoutGrid, href: "/marketplace", count: total },
  ];

  return (
    <ul className="lb-rail -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-4 sm:overflow-visible sm:px-0 sm:pb-0">
      {tiles.map(({ key, label, icon: Icon, href, count }, i) => {
        const everything = key === "all";
        return (
          <li key={key} className="w-[44%] shrink-0 sm:w-auto">
            <Link
              href={href}
              className={
                everything
                  ? "group relative flex h-full min-h-[148px] flex-col justify-between overflow-hidden rounded-[22px] bg-linear-to-br from-[#E0483B] to-[#FF7A59] p-4 text-white shadow-[0_18px_40px_-20px_rgba(224,72,59,0.9)] transition-transform duration-500 hover:-translate-y-1 sm:min-h-[168px] sm:p-5"
                  : "group relative flex h-full min-h-[148px] flex-col justify-between overflow-hidden rounded-[22px] border border-line bg-surface p-4 transition-all duration-500 hover:-translate-y-1 hover:border-accent-line hover:bg-accent-soft sm:min-h-[168px] sm:p-5"
              }
            >
              <div className="flex items-start justify-between">
                <span
                  className={
                    everything
                      ? "grid h-11 w-11 place-items-center rounded-2xl bg-white/20 backdrop-blur"
                      : "grid h-11 w-11 place-items-center rounded-2xl bg-surface-2 text-ink transition-colors duration-500 group-hover:bg-accent group-hover:text-on-accent"
                  }
                >
                  <Icon className="h-5 w-5 transition-transform duration-500 group-hover:-rotate-6" aria-hidden />
                </span>
                <span className={everything ? "tnum text-xs font-semibold text-white/70" : "tnum text-xs font-semibold text-ink-faint"}>
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div>
                <p className={everything ? "font-display text-lg font-bold leading-tight" : "font-display text-lg font-bold leading-tight text-ink"}>
                  {label}
                </p>
                <p className={everything ? "mt-1 flex items-center gap-1 text-xs text-white/80" : "mt-1 flex items-center gap-1 text-xs text-ink-muted"}>
                  {count > 0 ? `${count.toLocaleString()} live` : "Nothing listed yet"}
                  <ArrowUpRight
                    className="h-3.5 w-3.5 opacity-0 transition-all duration-500 group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden
                  />
                </p>
              </div>
              <Icon
                aria-hidden
                strokeWidth={1}
                className={
                  everything
                    ? "pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 text-white/15"
                    : "pointer-events-none absolute -bottom-6 -right-6 h-28 w-28 text-ink/[0.04] transition-colors duration-500 group-hover:text-accent/10"
                }
              />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
