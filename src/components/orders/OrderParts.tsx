"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ListingPlaceholder from "@/components/shop/ListingPlaceholder";
import { createClient } from "@/lib/supabase/client";
import { listOrders, orderStage, type OrderSummary } from "@/lib/orders/queries";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

export function useOrders(side: "buying" | "selling") {
  const { user, isLoading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!user) return Promise.resolve();
    return listOrders(createClient(), user.id, side)
      .then((rows) => {
        setOrders(rows);
        setError(null);
      })
      .catch((e: unknown) => {
        console.error("[lumenbay:orders] list failed", e);
        setError("Couldn't load your orders. Check your connection and try again.");
        setOrders((prev) => prev ?? []);
      });
  }, [user, side]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { orders, error, reload, loading: authLoading || (!!user && orders === null && !error) };
}

export const xlm = (n: number) => `${n.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM`;

export function daysAgo(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

const TONE: Record<ReturnType<typeof orderStage>["tone"], string> = {
  accent: "bg-accent-soft text-accent",
  ok: "bg-ok-bg text-ok",
  warn: "bg-warn-bg text-warn",
  bad: "bg-bad-bg text-bad",
  muted: "bg-surface-2 text-ink-muted",
};

export function StageChip({ order, className }: { order: OrderSummary; className?: string }) {
  const stage = orderStage(order);
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold", TONE[stage.tone], className)}>
      {stage.needsYou && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" aria-hidden />}
      {stage.label}
    </span>
  );
}

const STEPS = ["Paid", "Shipped", "Delivered"] as const;

/** Paid → Shipped → Delivered, as a compact three-segment bar. */
export function MiniTrack({ order }: { order: OrderSummary }) {
  const reached =
    order.state === "released" ? 3 : order.state === "in_transit" ? 2 : order.state === "funded" || order.state === "in_escrow" ? 1 : 0;
  const off = order.state === "disputed" || order.state === "refunded";
  return (
    <div className="flex w-full items-center gap-1" aria-label={off ? "Off the usual path" : `${STEPS[Math.max(reached - 1, 0)]}`}>
      {STEPS.map((s, i) => (
        <span
          key={s}
          className={cn("h-1 flex-1 rounded-full", off ? "bg-bad/40" : i < reached ? "bg-accent" : "bg-surface-3")}
        />
      ))}
    </div>
  );
}

export function OrderThumb({ order, className }: { order: OrderSummary; className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-xl bg-surface-2", className)}>
      {order.image ? (
        <Image src={order.image} alt="" fill sizes="96px" className="object-cover" />
      ) : (
        <ListingPlaceholder seed={order.productId} category="Order" showLabel={false} />
      )}
    </div>
  );
}

/** One order as a list row: picture, what, who, when, how much, where it is. */
export function OrderRow({ order }: { order: OrderSummary }) {
  const href = order.chainEscrowId ? `/dashboard/escrow/${order.chainEscrowId}` : "#";
  return (
    <li>
      <Link href={href} className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-2 sm:px-5">
        <OrderThumb order={order} className="h-14 w-14 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink group-hover:text-accent">{order.productName}</p>
          <p className="mt-0.5 truncate text-[11px] text-ink-faint">
            {order.role === "buyer" ? "From" : "To"} <span className="font-semibold text-ink-muted">{order.counterparty}</span>
            {" · "}
            {new Date(order.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
            {order.chainEscrowId && <> · #{order.chainEscrowId}</>}
          </p>
          <div className="mt-2 max-w-[180px]">
            <MiniTrack order={order} />
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <p className="tnum text-sm font-black text-ink">{xlm(order.totalXlm)}</p>
          <StageChip order={order} />
        </div>
      </Link>
    </li>
  );
}

/** Bigger card for the "needs you" rail. */
export function ActionCard({ order, cta, hint }: { order: OrderSummary; cta: string; hint: string }) {
  return (
    <Link
      href={`/dashboard/escrow/${order.chainEscrowId}`}
      className="group flex w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl border border-line bg-surface transition hover:-translate-y-0.5 hover:border-accent-line hover:shadow-xl hover:shadow-red-500/10 sm:w-[300px]"
    >
      <div className="relative">
        <OrderThumb order={order} className="aspect-[16/9] w-full rounded-none" />
        <StageChip order={order} className="absolute left-3 top-3 shadow-sm backdrop-blur" />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="truncate text-sm font-bold text-ink">{order.productName}</p>
        <p className="flex items-center gap-1 text-[11px] text-ink-faint">
          <Clock className="h-3 w-3" aria-hidden /> {hint}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="tnum text-base font-black text-ink">{xlm(order.totalXlm)}</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-linear-to-r from-[#E0483B] to-[#FF7A59] px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-red-500/20">
            {cta} <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** The dark ember panel that opens each dashboard. */
export function HubHero({
  eyebrow,
  title,
  figure,
  figureLabel,
  stats,
  children,
}: {
  eyebrow: string;
  title: string;
  figure: string;
  figureLabel: string;
  stats: { label: string; value: string }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="lb-vault lb-grain relative overflow-hidden rounded-3xl p-6 sm:p-8">
      <div aria-hidden className="lb-edge-glow absolute inset-x-0 top-0 h-px" />
      <div aria-hidden className="lb-dots absolute inset-0 text-white/[0.05]" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFB4A2]">{eyebrow}</p>
          <h1 className="font-display mt-2 text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">{title}</h1>
          <p className="mt-6 text-[11px] font-bold uppercase tracking-wider text-white/50">{figureLabel}</p>
          <p className="font-display lb-ember-text tnum mt-1 text-5xl font-extrabold tracking-[-0.03em] sm:text-6xl">{figure}</p>
          {children}
        </div>
        <dl className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-[420px]">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm sm:p-4">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-white/50">{s.label}</dt>
              <dd className="tnum mt-1 text-xl font-black text-white sm:text-2xl">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Panel({ title, count, action, children }: { title: string; count?: number; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-line bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <h2 className="flex items-center gap-2 text-sm font-black text-ink">
          {title}
          {count !== undefined && <span className="tnum rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-bold text-ink-muted">{count}</span>}
        </h2>
        {action}
      </header>
      {children}
    </section>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-line">
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} className="flex items-center gap-4 px-5 py-4">
          <span className="lb-skeleton h-14 w-14 rounded-xl" />
          <span className="flex flex-1 flex-col gap-2">
            <span className="lb-skeleton h-3 w-2/5 rounded" />
            <span className="lb-skeleton h-2.5 w-1/4 rounded" />
          </span>
          <span className="lb-skeleton h-5 w-20 rounded-full" />
        </li>
      ))}
    </ul>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="mb-3 mt-8 text-[11px] font-bold uppercase tracking-[0.22em] text-accent">{children}</p>;
}
