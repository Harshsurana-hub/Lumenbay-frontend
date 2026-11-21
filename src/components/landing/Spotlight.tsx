"use client";

import { useRef, type ReactNode } from "react";

/** A soft light that follows the pointer across its area. */
export default function Spotlight({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      className={`lb-spotlight ${className}`}
      onPointerMove={(e) => {
        const node = ref.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        node.style.setProperty("--x", `${e.clientX - rect.left}px`);
        node.style.setProperty("--y", `${e.clientY - rect.top}px`);
      }}
    >
      {children}
    </div>
  );
}
