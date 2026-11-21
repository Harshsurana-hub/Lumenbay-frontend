"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Why Lumenbay" },
  { href: "#testnet", label: "Testnet" },
  { href: "#faq", label: "FAQ" },
];

export default function LandingNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-white/10 bg-[#0B0807]/70 backdrop-blur-xl" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-lg shadow-orange-500/30">
            <Image src="/logo-icon.png" alt="" width={22} height={22} priority />
          </span>
          <span className="font-display text-base font-extrabold tracking-tight text-white sm:text-lg">Lumenbay</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-orange-100/70 transition-colors hover:text-white">
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/auth/login"
            className="whitespace-nowrap rounded-full px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm text-orange-100/90 transition-colors hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="whitespace-nowrap rounded-full bg-white px-3.5 py-2 text-xs font-bold sm:px-4 sm:text-sm text-[#1A0907] shadow-lg shadow-orange-500/30 transition hover:shadow-orange-400/50 hover:brightness-95"
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}
