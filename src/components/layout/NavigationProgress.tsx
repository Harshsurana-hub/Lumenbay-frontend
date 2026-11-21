"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Thin bar at the top of the page while a link navigation is in flight.
 *
 * Shown from the moment an internal link is clicked until the URL changes.
 * Visibility is derived (the bar shows only while the URL is still the one we
 * left from), so no effect has to reset it after navigation.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = `${pathname}?${searchParams.toString()}`;
  const [pendingFrom, setPendingFrom] = useState<string | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return;
      setPendingFrom(`${window.location.pathname}?${new URLSearchParams(window.location.search).toString()}`);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (pendingFrom === null || pendingFrom !== currentUrl) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5" role="progressbar" aria-label="Loading page">
      <div className="lb-nav-progress h-full bg-linear-to-r from-[#E0483B] via-[#FF7A59] to-[#FFB4A2] shadow-[0_0_10px_rgba(255,122,89,0.8)]" />
    </div>
  );
}
