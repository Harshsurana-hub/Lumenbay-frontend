import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Section opener used across the shop: a numbered eyebrow, a display
 * headline, and an optional "see all" link aligned to the baseline.
 */
export default function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  action?: { href: string; label: string };
  className?: string;
}) {
  return (
    <div className={cn("mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <p className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">
          {index && <span className="tnum text-ink-faint">{index}</span>}
          {index && <span aria-hidden className="h-px w-6 bg-accent-line" />}
          {eyebrow}
        </p>
        <h2 className="font-display mt-3 text-[28px] font-bold leading-[1.05] tracking-[-0.02em] text-ink sm:text-[36px]">
          {title}
        </h2>
        {description && <p className="mt-2 max-w-xl text-sm text-ink-muted">{description}</p>}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-ink sm:self-auto"
        >
          {action.label}
          <ArrowUpRight
            className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      )}
    </div>
  );
}
