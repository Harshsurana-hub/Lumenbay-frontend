"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AlertTriangle, ArrowRight, Compass, RefreshCw, ShieldCheck } from "lucide-react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import {
  ActionCard,
  HubHero,
  ListSkeleton,
  OrderRow,
  Panel,
  SectionLabel,
  daysAgo,
  useOrders,
  xlm,
} from "@/components/orders/OrderParts";
import { useAuth } from "@/context/AuthContext";
import { useWallet } from "@/context/WalletContext";
import { parseOrderTag } from "@/lib/orderTag";
import { getEscrow } from "@/lib/stellar/escrow";
import { journalSnapshot, parseJournal, subscribeJournal } from "@/lib/stellar/paymentJournal";
import { cn } from "@/lib/utils";

type Filter = "all" | "active" | "done";

const ACTIVE = new Set(["funded", "in_escrow", "in_transit", "disputed"]);

export default function BuyingDashboard() {
  const { orders, error, reload, loading } = useOrders("buying");
  const wallet = useWallet();
  const { user } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");

  const list = useMemo(() => orders ?? [], [orders]);
  const toConfirm = list.filter((o) => o.state === "in_transit");
  const active = list.filter((o) => o.state && ACTIVE.has(o.state));
  const done = list.filter((o) => o.state === "released" || o.state === "refunded");
  const locked = active.reduce((sum, o) => sum + o.totalXlm, 0);
  const shown = filter === "active" ? active : filter === "done" ? done : list;

  // Payments this browser made that never reached the database (e.g. the tab
  // closed between locking and saving). Surfaced so they can be saved.
  const rawJournal = useSyncExternalStore(subscribeJournal, journalSnapshot, () => "");
  const candidates = useMemo(() => {
    if (!orders || !wallet.address) return [];
    const saved = new Set(orders.map((o) => o.chainEscrowId));
    const funded = parseJournal(rawJournal).filter((e) => e.step === "escrow_funded" && e.buyer === wallet.address && e.escrowId);
    return [...new Set(funded.map((e) => e.escrowId!))].filter((id) => !saved.has(id));
  }, [orders, rawJournal, wallet.address]);

  // Only offer the ones the server will accept: tagged on-chain with this account.
  const [unsaved, setUnsaved] = useState<string[]>([]);
  useEffect(() => {
    if (!user || candidates.length === 0) return;
    let cancelled = false;
    Promise.all(
      candidates.map((id) =>
        getEscrow(BigInt(id))
          .then((e) => (e && e.status !== "Pending" && parseOrderTag(e.metadata)?.buyerUserId === user.id ? id : null))
          .catch(() => null),
      ),
    ).then((ids) => !cancelled && setUnsaved(ids.filter((id): id is string => !!id)));
    return () => {
      cancelled = true;
    };
  }, [candidates, user]);

  return (
    <div className="min-h-screen bg-bg">
      <div className="pt-14">
        <DashboardSubnav />

        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <HubHero
            eyebrow="Buying"
            title="Your purchases"
            figureLabel="Your money held safely in escrow"
            figure={loading ? "…" : xlm(locked)}
            stats={[
              { label: "Active", value: loading ? "–" : String(active.length) },
              { label: "To confirm", value: loading ? "–" : String(toConfirm.length) },
              { label: "Completed", value: loading ? "–" : String(done.filter((o) => o.state === "released").length) },
            ]}
          >
            <p className="mt-3 flex max-w-md items-start gap-2 text-xs text-white/60">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FFB4A2]" aria-hidden />
              Sellers only get paid when you confirm an item arrived. Until then the XLM sits in the escrow contract, not with Lumenbay.
            </p>
          </HubHero>

          {error && (
            <div role="alert" className="mt-6 flex items-center justify-between gap-3 rounded-xl border border-bad-line bg-bad-bg p-3 text-sm text-bad">
              <span className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> {error}</span>
              <button onClick={() => reload()} className="inline-flex items-center gap-1 text-xs font-bold"><RefreshCw className="h-3.5 w-3.5" /> Retry</button>
            </div>
          )}

          {candidates.length > 0 && unsaved.length > 0 && (
            <div className="mt-6 rounded-2xl border border-warn-line bg-warn-bg p-4 text-sm text-warn">
              <p className="font-bold">{unsaved.length === 1 ? "1 payment isn't" : `${unsaved.length} payments aren't`} saved to your account yet</p>
              <p className="mt-1 text-xs">Your XLM is locked and safe. Open each one and tap &ldquo;Save this order&rdquo; so the seller can see it.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {unsaved.map((id) => (
                  <Link key={id} href={`/dashboard/escrow/${id}`} className="rounded-full bg-warn px-3 py-1 text-xs font-bold text-white">
                    Escrow #{id}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {toConfirm.length > 0 && (
            <>
              <SectionLabel>Needs you · arrived?</SectionLabel>
              <div className="lb-rail lb-fade-x -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
                {toConfirm.map((o) => (
                  <ActionCard
                    key={o.orderId}
                    order={o}
                    cta="Confirm"
                    hint={o.shippedAt ? `Shipped ${daysAgo(o.shippedAt)}` : "On its way"}
                  />
                ))}
              </div>
            </>
          )}

          <SectionLabel>Order history</SectionLabel>
          <Panel
            title="All purchases"
            count={orders ? list.length : undefined}
            action={
              <div className="flex gap-1">
                {(["all", "active", "done"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-bold capitalize transition-colors",
                      filter === f ? "bg-ink text-bg" : "text-ink-muted hover:bg-surface-2",
                    )}
                  >
                    {f === "done" ? "Finished" : f}
                  </button>
                ))}
              </div>
            }
          >
            {loading ? (
              <ListSkeleton />
            ) : shown.length === 0 ? (
              <EmptyState filtered={filter !== "all" && list.length > 0} />
            ) : (
              <ul className="divide-y divide-line">
                {shown.map((o) => <OrderRow key={o.orderId} order={o} />)}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ filtered }: { filtered: boolean }) {
  if (filtered) return <p className="px-5 py-10 text-center text-sm text-ink-muted">Nothing here with this filter.</p>;
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
        <Compass className="h-6 w-6" aria-hidden />
      </span>
      <p className="text-sm font-bold text-ink">No purchases yet</p>
      <p className="max-w-xs text-xs text-ink-muted">When you buy with escrow, each order shows up here with exactly where your money is.</p>
      <Link href="/home" className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-bold text-on-accent hover:bg-accent-hover">
        Browse the marketplace <ArrowRight className="h-3.5 w-3.5" aria-hidden />
      </Link>
    </div>
  );
}
