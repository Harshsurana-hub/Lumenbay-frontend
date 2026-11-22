"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  label: string;
}

/** Tracks which section is on screen, so the table of contents can mark it. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.set(e.target.id, e.boundingClientRect.top);
          else visible.delete(e.target.id);
        }
        // The topmost section still in the reading band wins.
        const next = ids.find((id) => visible.has(id));
        if (next) setActive(next);
      },
      { rootMargin: "-120px 0px -55% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

/** Sticky side rail on large screens. */
export function GuideTocRail({ items }: { items: TocItem[] }) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const active = useActiveSection(ids);
  return (
    <nav aria-label="On this page" className="sticky top-28 hidden max-h-[calc(100vh-8rem)] overflow-y-auto pb-6 lg:block">
      <p className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-faint">
        <ListOrdered className="h-3.5 w-3.5" aria-hidden /> On this page
      </p>
      <ol className="relative flex flex-col border-l border-line">
        {items.map((item, i) => {
          const on = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={on ? "location" : undefined}
                className={cn(
                  "-ml-px flex items-baseline gap-2.5 border-l-2 py-1.5 pl-4 text-sm transition-colors",
                  on ? "border-accent font-semibold text-ink" : "border-transparent text-ink-muted hover:border-line-strong hover:text-ink",
                )}
              >
                <span className={cn("tnum text-[10px] font-bold", on ? "text-accent" : "text-ink-faint")}>{String(i + 1).padStart(2, "0")}</span>
                {item.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Collapsible list for phones and tablets, built on native <details>. */
export function GuideTocCompact({ items }: { items: TocItem[] }) {
  return (
    <details className="group rounded-2xl border border-line bg-surface lg:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2"><ListOrdered className="h-4 w-4 text-accent" aria-hidden /> Jump to a section</span>
        <ChevronDown className="h-4 w-4 text-ink-faint transition-transform group-open:rotate-180" aria-hidden />
      </summary>
      <ol className="grid gap-0.5 border-t border-line p-2 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="flex items-baseline gap-2.5 rounded-lg px-2.5 py-2 text-sm text-ink-muted hover:bg-surface-2 hover:text-ink">
              <span className="tnum text-[10px] font-bold text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </details>
  );
}
