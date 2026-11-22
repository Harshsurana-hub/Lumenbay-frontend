"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, Gavel, RefreshCw, Scale, Truck, Unlink } from "lucide-react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import { HubHero, ListSkeleton, Panel, SectionLabel, xlm } from "@/components/orders/OrderParts";
import { fetchDisputes } from "@/lib/admin/client";
import { REASON_LABEL, durationLabel } from "@/lib/admin/disputes";
import type { DisputeList, DisputeSummary, ResolvedSummary } from "@/lib/admin/server";
import { explorerTx } from "@/lib/stellar/config";
import { stroopsToXlm } from "@/lib/stellar/escrow";
import { cn } from "@/lib/utils";

export default function AdminDisputesPage() {
  const [data, setData] = useState<DisputeList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      setData(await fetchDisputes());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = data?.open ?? [];
  const locked = open.reduce((sum, d) => sum + stroopsToXlm(d.amountStroops), 0);
  const oldest = open.reduce<string | null>((min, d) => (d.openedAt && (!min || d.openedAt < min) ? d.openedAt : min), null);

  return (
    <div className="min-h-screen bg-bg">
      <div className="pt-14">
        <DashboardSubnav title="Admin" />

        <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
          <HubHero
            eyebrow="Admin · Disputes"
            title="Disputes waiting on a decision"
            figureLabel="Buyer money locked in open disputes"
            figure={data ? xlm(locked) : "…"}
            stats={[
              { label: "Open", value: data ? String(open.length) : "–" },
              { label: "Oldest", value: data ? (oldest ? durationLabel(oldest) : "–") : "–" },
              { label: "Resolved", value: data ? String(data.resolved.length) : "–" },
            ]}
          >
            <p className="mt-3 flex max-w-md items-start gap-2 text-xs text-white/60">
              <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FFB4A2]" aria-hidden />
              Each decision is signed on-chain by the contract admin wallet. The contract refunds the buyer or releases to the seller in full; it doesn&apos;t split.
            </p>
          </HubHero>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-ink-faint">
              {data ? <>Checked against the contract {new Date(data.syncedAt).toLocaleTimeString()}</> : "Scanning the contract…"}
            </p>
            <button onClick={() => load()} disabled={refreshing} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-faint hover:text-accent disabled:opacity-60">
              <RefreshCw className={cn("h-3.5 w-3.5", refreshing && "animate-spin")} /> Sync with chain
            </button>
          </div>

          {error && <Banner tone="bad">{error}</Banner>}
          {data?.chainError && <Banner tone="warn">{data.chainError}</Banner>}

          <SectionLabel>Needs a decision</SectionLabel>
          <Panel title="Open disputes" count={data ? open.length : undefined}>
            {!data ? (
              <ListSkeleton />
            ) : open.length === 0 ? (
              <Empty />
            ) : (
              <ul className="divide-y divide-line">
                {open.map((d) => <DisputeRow key={d.chainEscrowId} d={d} />)}
              </ul>
            )}
          </Panel>

          {data && data.unrecorded.length > 0 && (
            <>
              <SectionLabel>Settled on-chain, not written up</SectionLabel>
              <Panel title="Needs an internal note" count={data.unrecorded.length}>
                <p className="border-b border-line px-5 py-3 text-xs text-ink-muted">
                  These were resolved on-chain outside the app (for example from the CLI). Open one and record the transaction and your note so there&apos;s an audit trail.
                </p>
                <ul className="divide-y divide-line">
                  {data.unrecorded.map((d) => <DisputeRow key={d.chainEscrowId} d={d} />)}
                </ul>
              </Panel>
            </>
          )}

          <SectionLabel>History</SectionLabel>
          <Panel title="Recently resolved" count={data ? data.resolved.length : undefined}>
            {!data ? (
              <ListSkeleton rows={2} />
            ) : data.resolved.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-ink-muted">No disputes resolved yet.</p>
            ) : (
              <ul className="divide-y divide-line">
                {data.resolved.map((r) => <ResolvedRow key={r.chainEscrowId} r={r} />)}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

function DisputeRow({ d }: { d: DisputeSummary }) {
  const resolved = d.chainStatus === "Refunded" || d.chainStatus === "Released";
  return (
    <li>
      <Link href={`/dashboard/admin/disputes/${d.chainEscrowId}`} className="group flex items-center gap-4 px-4 py-4 transition-colors hover:bg-surface-2 sm:px-5">
        <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", resolved ? "bg-ok-bg text-ok" : "bg-bad-bg text-bad")}>
          {resolved ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : <Gavel className="h-5 w-5" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-ink group-hover:text-accent">{d.productName}</p>
          <p className="mt-0.5 truncate text-[11px] text-ink-faint">
            <span className="font-semibold text-ink-muted">{d.buyerName}</span> bought from <span className="font-semibold text-ink-muted">{d.sellerName}</span> · #{d.chainEscrowId}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {d.reason && <Chip tone="bad">{REASON_LABEL[d.reason] ?? d.reason}</Chip>}
            {d.shippedAt ? (
              <Chip tone="muted"><Truck className="h-3 w-3" aria-hidden /> Shipped {new Date(d.shippedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</Chip>
            ) : (
              d.recorded && <Chip tone="warn">Not marked shipped</Chip>
            )}
            {!d.recorded && <Chip tone="warn"><Unlink className="h-3 w-3" aria-hidden /> Not a recorded order</Chip>}
            {resolved && <Chip tone="ok">{d.chainStatus === "Refunded" ? "Refunded on-chain" : "Released on-chain"}</Chip>}
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <p className="tnum text-sm font-black text-ink">{xlm(stroopsToXlm(d.amountStroops))}</p>
          {d.openedAt && <p className="text-[11px] font-semibold text-ink-faint">open {durationLabel(d.openedAt)}</p>}
        </div>
      </Link>
    </li>
  );
}

function ResolvedRow({ r }: { r: ResolvedSummary }) {
  return (
    <li className="flex items-center gap-4 px-4 py-3 sm:px-5">
      <Link href={`/dashboard/admin/disputes/${r.chainEscrowId}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-ink hover:text-accent">{r.productName}</p>
        <p className="text-[11px] text-ink-faint">
          {r.outcome === "refund" ? "Refunded to buyer" : "Released to seller"} by {r.adminName} · {new Date(r.createdAt).toLocaleString()}
        </p>
      </Link>
      <span className="tnum text-sm font-black text-ink">{xlm(stroopsToXlm(r.amountStroops))}</span>
      <a href={explorerTx(r.txHash)} target="_blank" rel="noreferrer" className="text-ink-faint hover:text-accent" aria-label="View transaction">
        <ExternalLink className="h-4 w-4" />
      </a>
    </li>
  );
}

const CHIP = {
  bad: "bg-bad-bg text-bad",
  warn: "bg-warn-bg text-warn",
  ok: "bg-ok-bg text-ok",
  muted: "bg-surface-2 text-ink-muted",
};

function Chip({ tone, children }: { tone: keyof typeof CHIP; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold", CHIP[tone])}>{children}</span>;
}

function Banner({ tone, children }: { tone: "bad" | "warn"; children: React.ReactNode }) {
  return (
    <div role="alert" className={cn("mt-4 flex items-center gap-2 rounded-xl border p-3 text-sm", tone === "bad" ? "border-bad-line bg-bad-bg text-bad" : "border-warn-line bg-warn-bg text-warn")}>
      <AlertTriangle className="h-4 w-4 shrink-0" /> {children}
    </div>
  );
}

function Empty() {
  return (
    <div className="flex flex-col items-center gap-3 px-5 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ok-bg text-ok">
        <CheckCircle2 className="h-6 w-6" aria-hidden />
      </span>
      <p className="text-sm font-bold text-ink">No open disputes</p>
      <p className="max-w-xs text-xs text-ink-muted">When a buyer reports a problem, the order shows up here with its money still locked.</p>
    </div>
  );
}
