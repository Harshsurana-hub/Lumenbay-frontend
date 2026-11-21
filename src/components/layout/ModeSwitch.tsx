"use client";

import Link from "next/link";
import { ShoppingBag, Store } from "lucide-react";
import { MODE_HOME, rememberMode, useAccountMode, type AccountMode } from "@/lib/accountMode";
import { cn } from "@/lib/utils";

const MODES: { mode: AccountMode; label: string; Icon: typeof ShoppingBag }[] = [
  { mode: "buying", label: "Buying", Icon: ShoppingBag },
  { mode: "selling", label: "Selling", Icon: Store },
];

/**
 * Segmented Buying / Selling switch. Every account can do both; this jumps
 * between the purchases dashboard and the seller hub.
 */
export default function ModeSwitch({ className }: { className?: string }) {
  const current = useAccountMode();

  return (
    <div
      role="group"
      aria-label="Account mode"
      className={cn("relative flex items-center rounded-full border border-line bg-surface-2 p-0.5", className)}
    >
      {/* Sliding thumb */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0.5 left-0.5 w-[calc(50%-2px)] rounded-full bg-linear-to-r from-[#E0483B] to-[#FF7A59] shadow-md shadow-red-500/25 transition-transform duration-300 ease-out",
          current === "selling" && "translate-x-full",
        )}
      />
      {MODES.map(({ mode, label, Icon }) => {
        const active = current === mode;
        return (
          <Link
            key={mode}
            href={MODE_HOME[mode]}
            onClick={() => rememberMode(mode)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative z-10 flex w-1/2 min-w-[84px] items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors",
              active ? "text-white" : "text-ink-muted hover:text-ink",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
