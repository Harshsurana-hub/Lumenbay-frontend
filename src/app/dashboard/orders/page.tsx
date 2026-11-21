"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Loader2, Package, ShoppingBag, Store, Wallet } from "lucide-react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import { useWallet } from "@/context/WalletContext";
import { createClient } from "@/lib/supabase/client";
import { getProductsByIds } from "@/lib/products";
import { getEscrow, type OnChainStatus } from "@/lib/stellar/escrow";
import { escrowsForWallet, journalSnapshot, parseJournal, subscribeJournal } from "@/lib/stellar/paymentJournal";

type Tab = "purchases" | "sales";

const STATUS_STYLE: Record<OnChainStatus, { label: string; cls: string }> = {
  Pending: { label: "Awaiting payment", cls: "bg-warn-bg text-warn" },
  Funded: { label: "Funds locked", cls: "bg-accent-soft text-accent" },
  Released: { label: "Completed", cls: "bg-ok-bg text-ok" },
  Disputed: { label: "In dispute", cls: "bg-bad-bg text-bad" },
  Refunded: { label: "Refunded", cls: "bg-ok-bg text-ok" },
  Cancelled: { label: "Cancelled", cls: "bg-surface-2 text-ink-muted" },
};

export default function OrdersPage() {
  const wallet = useWallet();
  const [tab, setTab] = useState<Tab>("purchases");
  const [statuses, setStatuses] = useState<Record<string, OnChainStatus | "unknown">>({});
  const [names, setNames] = useState<Record<string, string>>({});

  const rawJournal = useSyncExternalStore(subscribeJournal, journalSnapshot, () => "");
  const orders = useMemo(
    () => (wallet.address ? escrowsForWallet(wallet.address, parseJournal(rawJournal)) : []),
    [rawJournal, wallet.address],
  );

  // Status always comes from the chain; the journal only tells us which escrows to look up.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        orders.map(async (o) => {
          try {
            const onChain = await getEscrow(BigInt(o.escrowId!));
            return [o.escrowId!, onChain?.status ?? "unknown"] as const;
          } catch {
            return [o.escrowId!, "unknown"] as const;
          }
        }),
      );
      if (!cancelled) setStatuses(Object.fromEntries(entries));
    })();
    return () => {
      cancelled = true;
    };
  }, [orders]);

  useEffect(() => {
    const ids = [...new Set(orders.map((o) => o.productId).filter((id): id is string => !!id))];
    if (!ids.length) return;
    let cancelled = false;
    getProductsByIds(createClient(), ids)
      .then((products) => {
        if (!cancelled) setNames(Object.fromEntries(products.map((p) => [p.id, p.name])));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [orders]);

  const purchases = orders.filter((o) => o.buyer === wallet.address);
  const sales = orders.filter((o) => o.seller === wallet.address);
  const shown = tab === "purchases" ? purchases : sales;
  const lockedXlm = purchases
    .filter((o) => statuses[o.escrowId!] === "Funded" || statuses[o.escrowId!] === "Disputed")
    .reduce((sum, o) => sum + (o.amountXlm ?? 0), 0);

  return (
    <div className="min-h-screen bg-bg">
      <div className="pt-14">
        <DashboardSubnav title="My Account" />

        <div className="mx-auto max-w-5xl px-4 py-6">
          {!wallet.address ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-line bg-surface p-10 text-center">
              <Wallet className="h-8 w-8 text-accent" />
              <p className="text-sm font-bold text-ink">Connect your wallet to see your orders</p>
              <p className="max-w-sm text-xs text-ink-muted">Orders are escrows on the Stellar network, so we look them up by the wallet you paid or got paid with.</p>
              <button onClick={() => wallet.connect()} disabled={wallet.connecting} className="mt-2 inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-on-accent hover:bg-accent-hover disabled:opacity-60">
                {wallet.connecting && <Loader2 className="h-4 w-4 animate-spin" />} Connect wallet
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                <Stat label="Purchases" value={purchases.length.toString()} />
                <Stat label="Sales" value={sales.length.toString()} />
                <Stat label="Your money in escrow" value={`${lockedXlm.toLocaleString()} XLM`} highlight={lockedXlm > 0} />
                <Stat label="Wallet balance" value={wallet.balance === null ? "…" : `${wallet.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} XLM`} />
              </div>

              <div className="overflow-hidden rounded-2xl border border-line bg-surface">
                <div className="flex items-center gap-1 border-b border-line p-2">
                  <TabButton active={tab === "purchases"} onClick={() => setTab("purchases")} icon={<ShoppingBag className="h-4 w-4" />}>
                    Purchases · {purchases.length}
                  </TabButton>
                  <TabButton active={tab === "sales"} onClick={() => setTab("sales")} icon={<Store className="h-4 w-4" />}>
                    Sales · {sales.length}
                  </TabButton>
                </div>

                {shown.length === 0 ? (
                  <p className="px-5 py-10 text-center text-sm text-ink-muted">
                    {tab === "purchases" ? "You haven't bought anything with escrow yet." : "No sales recorded for this wallet in this browser yet."}
                  </p>
                ) : (
                  <ul className="divide-y divide-line">
                    {shown.map((o) => {
                      const status = statuses[o.escrowId!];
                      const style = status && status !== "unknown" ? STATUS_STYLE[status] : null;
                      return (
                        <li key={o.escrowId}>
                          <Link href={`/dashboard/escrow/${o.escrowId}`} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-2">
                              <Package className="h-5 w-5 text-ink-faint" />
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-bold text-ink">
                                {(o.productId && names[o.productId]) || `Escrow #${o.escrowId}`}
                              </p>
                              <p className="text-[11px] text-ink-faint">
                                <span className="font-semibold text-ink-muted">{tab === "purchases" ? "You're the buyer" : "You're the seller"}</span>
                                {" · "}Escrow #{o.escrowId} · {new Date(o.at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-black tabular-nums text-ink">{o.amountXlm?.toLocaleString()} XLM</p>
                              {style ? (
                                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-bold ${style.cls}`}>{style.label}</span>
                              ) : (
                                <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-ink-faint">
                                  <Loader2 className="h-3 w-3 animate-spin" /> checking
                                </span>
                              )}
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              <p className="mt-3 text-[11px] text-ink-faint">
                Showing orders for {wallet.address.slice(0, 6)}…{wallet.address.slice(-4)} recorded in this browser. Status is read live from the Stellar network.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 ${highlight ? "border-accent-line bg-accent-soft" : "border-line bg-surface"}`}>
      <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">{label}</p>
      <p className={`mt-1 text-xl font-black tabular-nums ${highlight ? "text-accent" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function TabButton({ active, onClick, icon, children }: { active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
        active ? "bg-accent text-on-accent" : "text-ink-muted hover:bg-surface-2"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
