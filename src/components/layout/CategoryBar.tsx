"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LayoutGrid, ShieldCheck, Sparkle } from "lucide-react";
import { isStandalonePage } from "@/lib/standalonePages";
import { SHOP_CATEGORIES } from "@/lib/shopDisplay";
import { cn } from "@/lib/utils";

/**
 * The shop's second row: where to browse, and the one promise every listing
 * shares. A quiet glass strip rather than a solid accent bar, so the colour on
 * the page is spent on the listings and the one action that matters.
 */
export default function CategoryBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? searchParams.get("cat") ?? "";

  if (
    isStandalonePage(pathname) ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile")
  )
    return null;

  const onHome = pathname === "/home";
  const pill =
    "inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] font-medium transition-colors";
  const idle = "text-ink-muted hover:bg-surface-2 hover:text-ink";
  const active = "bg-ink text-bg font-semibold";

  return (
    <nav
      aria-label="Shop categories"
      className="fixed left-0 right-0 top-14 z-40 flex h-10 items-center border-b border-line bg-bg/75 backdrop-blur-xl backdrop-saturate-150"
    >
      <div className="lb-rail lb-fade-x flex min-w-0 flex-1 items-center gap-1 overflow-x-auto px-3 sm:px-5">
        <Link
          href="/marketplace"
          aria-current={pathname === "/marketplace" ? "page" : undefined}
          className={cn(pill, pathname === "/marketplace" ? active : idle)}
        >
          <LayoutGrid className="h-3.5 w-3.5" aria-hidden />
          Marketplace
        </Link>

        <span aria-hidden className="mx-1.5 h-4 w-px shrink-0 bg-line-strong" />

        <Link
          href="/home"
          aria-current={onHome && !currentCategory ? "page" : undefined}
          className={cn(pill, onHome && !currentCategory ? active : idle)}
        >
          <Sparkle className="h-3.5 w-3.5" aria-hidden />
          Discover
        </Link>

        {SHOP_CATEGORIES.map(({ label, value, icon: Icon }) => {
          const isActive = onHome && currentCategory === value;
          return (
            <Link
              key={value}
              href={`/home?category=${encodeURIComponent(value)}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(pill, isActive ? active : idle)}
            >
              <Icon className={cn("h-3.5 w-3.5", isActive ? "" : "text-ink-faint")} aria-hidden />
              {label}
            </Link>
          );
        })}
        <span aria-hidden className="w-4 shrink-0" />
      </div>

      <p className="hidden shrink-0 items-center gap-1.5 border-l border-line px-5 text-xs font-medium text-ink-muted lg:flex">
        <ShieldCheck className="h-3.5 w-3.5 text-accent" aria-hidden />
        Every payment held in escrow until delivery
      </p>
    </nav>
  );
}
