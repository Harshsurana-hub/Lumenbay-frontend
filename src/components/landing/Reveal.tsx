"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/** Fades and lifts its children into view the first time they scroll on screen. */
export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as never}
      data-visible={visible}
      style={{ transitionDelay: `${delay}ms` }}
      className={`lb-reveal ${className}`}
    >
      {children}
    </Tag>
  );
}
