"use client";

import { usePathname } from "next/navigation";
import { useEffect, useSyncExternalStore } from "react";

/**
 * Buying or selling: one account does both, and this decides which side of
 * the dashboard it's looking at.
 *
 * The URL decides when it can (anything under the seller hub is selling,
 * purchases are buying). Shared pages like the wallet keep whichever mode
 * the person was last in, remembered per browser.
 */

export type AccountMode = "buying" | "selling";

const KEY = "lumenbay-mode";
const EVENT = "lumenbay-mode-change";

export const MODE_HOME: Record<AccountMode, string> = {
  buying: "/dashboard/buying",
  selling: "/dashboard/selling",
};

function modeFromPath(pathname: string): AccountMode | null {
  if (pathname.startsWith("/dashboard/selling")) return "selling";
  if (pathname.startsWith("/dashboard/buying") || pathname.startsWith("/dashboard/wishlist")) return "buying";
  return null;
}

function stored(): AccountMode {
  try {
    return localStorage.getItem(KEY) === "selling" ? "selling" : "buying";
  } catch {
    return "buying";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function rememberMode(mode: AccountMode) {
  try {
    if (localStorage.getItem(KEY) === mode) return;
    localStorage.setItem(KEY, mode);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Private mode: the URL still decides on most pages.
  }
}

export function useAccountMode(): AccountMode {
  const pathname = usePathname();
  const fromPath = modeFromPath(pathname);
  const remembered = useSyncExternalStore(subscribe, stored, () => "buying" as AccountMode);

  useEffect(() => {
    if (fromPath) rememberMode(fromPath);
  }, [fromPath]);

  return fromPath ?? remembered;
}
