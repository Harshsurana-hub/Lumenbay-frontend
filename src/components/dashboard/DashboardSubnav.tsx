"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ModeSwitch from "@/components/layout/ModeSwitch";
import { useAccountMode, type AccountMode } from "@/lib/accountMode";

const TABS: Record<AccountMode, { label: string; href: string; exact?: boolean }[]> = {
  buying: [
    { label: "Purchases", href: "/dashboard/buying" },
    { label: "Wishlist", href: "/dashboard/wishlist" },
    { label: "Activity", href: "/dashboard/activity" },
    { label: "Wallet", href: "/dashboard/wallet" },
    { label: "Profile", href: "/profile" },
  ],
  selling: [
    { label: "Seller hub", href: "/dashboard/selling", exact: true },
    { label: "List an item", href: "/dashboard/selling/new" },
    { label: "Activity", href: "/dashboard/activity" },
    { label: "Wallet", href: "/dashboard/wallet" },
    { label: "Profile", href: "/profile" },
  ],
};

export default function DashboardSubnav({ title }: { title?: string }) {
  const pathname = usePathname();
  const mode = useAccountMode();

  return (
    <div className="flex h-12 items-center justify-between gap-3 border-b border-line bg-surface px-4 sm:px-6">
      <h1 className="hidden shrink-0 text-sm font-bold text-ink sm:block">
        {title ?? (mode === "selling" ? "Selling" : "Buying")}
      </h1>
      <ModeSwitch className="shrink-0 lg:hidden" />
      <div className="flex min-w-0 items-center gap-1 overflow-x-auto scrollbar-none">
        {TABS[mode].map((tab) => {
          const active = tab.exact ? pathname === tab.href : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold transition-colors ${
                active ? "bg-accent text-on-accent" : "bg-surface-2 text-ink-muted hover:bg-surface-3 hover:text-ink"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
