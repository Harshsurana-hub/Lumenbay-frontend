"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowDownUp, ChevronLeft, ChevronRight, ExternalLink, Gavel, RefreshCw, Scale, Search, SlidersHorizontal, X } from "lucide-react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import ListingPlaceholder from "@/components/shop/ListingPlaceholder";
import { ListSkeleton, xlm } from "@/components/orders/OrderParts";
import { useDebounce } from "@/hooks/useDebounce";
import { fetchDisputeQueue } from "@/lib/admin/client";
import { REASON_LABEL, durationLabel } from "@/lib/admin/disputes";
import {
  DEFAULT_QUERY,
  PAGE_SIZE,
  REASONS,
  ageTone,
  parseDisputeQuery,
  toSearchParams,
  type DisputeQuery,
  type DisputeRow,
  type DisputeTab,
} from "@/lib/admin/disputeQuery";
import type { DisputeQueue } from "@/lib/admin/server";
import { explorerTx } from "@/lib/stellar/config";
import { stroopsToXlm } from "@/lib/stellar/escrow";
import { cn } from "@/lib/utils";
import DisputeDetailView from "./DisputeDetailView";

const BASE = "/dashboard/admin/disputes";

/**
 * The disputes queue: summary strip, tabs, search, filters, sort and
 * server-side pages, all mirrored in the URL. A row opens the dispute in a
 * side drawer at /dashboard/admin/disputes/<id>, so the list stays mounted
 * underneath (same scroll position on close) and the deep link still works.
 * URL changes use the History API, which Next keeps in sync with
 * usePathname / useSearchParams without re-rendering the route.
 */
export default function DisputesWorkspace() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = useMemo(() => parseDisputeQuery(searchParams), [searchParams]);
  const queryKey = toSearchParams(query).toString();
  const openId = pathname.match(/\/disputes\/(\d+)\/?$/)?.[1] ?? null;

  const [data, setData] = useState<DisputeQueue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const pushedDrawer = useRef(false);

  const load = useCallback(async (sync = false) => {
    setLoading(true);
    if (sync) setSyncing(true);
    try {
      setData(await fetchDisputeQueue(parseDisputeQuery(new URLSearchParams(queryKey)), sync));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, [queryKey]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Change the query; anything but a page change goes back to page 1. */
  const setQuery = useCallback(
    (patch: Partial<DisputeQuery>) => {
      const next = { ...query, ...patch, page: "page" in patch ? patch.page ?? 1 : 1 };
      const search = toSearchParams(next).toString();
      window.history.replaceState(null, "", `${openId ? `${BASE}/${openId}` : BASE}${search ? `?${search}` : ""}`);
    },
    [query, openId],
  );

  const openRow = (id: string) => {
    pushedDrawer.current = true;
    window.history.pushState(null, "", `${BASE}/${id}${queryKey ? `?${queryKey}` : ""}`);
  };
  const closeDrawer = useCallback(() => {
    if (pushedDrawer.current) {
      pushedDrawer.current = false;
      window.history.back();
    } else {
      // Arrived on the deep link: swap it for the list instead of leaving the app.
      window.history.replaceState(null, "", `${BASE}${queryKey ? `?${queryKey}` : ""}`);
    }
  }, [queryKey]);

  const s = data?.summary;

  return (
    <div className="min-h-screen bg-bg">
      <div className="pt-14">
        <DashboardSubnav title="Admin" />

        <div className="mx-auto max-w-6xl px-4 py-6 sm:py-8">
          {/* Summary strip */}
          <section className="lb-vault lb-grain relative overflow-hidden rounded-3xl p-5 sm:p-6">
            <div aria-hidden className="lb-edge-glow absolute inset-x-0 top-0 h-px" />
            <div aria-hidden className="lb-dots absolute inset-0 text-white/[0.05]" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFB4A2]">Admin · Disputes</p>
                <h1 className="font-display mt-1 text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">Dispute queue</h1>
                <p className="mt-2 flex max-w-md items-start gap-2 text-xs text-white/60">
                  <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FFB4A2]" aria-hidden />
                  Each ruling is signed on-chain by the contract admin wallet: a full refund or a full release.
                </p>
              </div>
              <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[620px]">
                <Stat label="Open" value={s ? String(s.openCount) : "–"} />
                <Stat label="XLM locked" value={s ? compactXlm(stroopsToXlm(s.lockedStroops)) : "–"} title={s ? xlm(stroopsToXlm(s.lockedStroops)) : undefined} ember />
                <Stat label="Oldest open" value={s ? (s.oldestOpenAt ? durationLabel(s.oldestOpenAt) : "–") : "–"} />
                <Stat label="Resolved this week" value={s ? String(s.resolvedThisWeek) : "–"} />
              </dl>
            </div>
          </section>

          {error && <Banner tone="bad">{error}</Banner>}
          {data?.chainError && <Banner tone="warn">{data.chainError}</Banner>}

          {/* Tabs and sync */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <div role="tablist" aria-label="Dispute status" className="flex gap-1 rounded-full bg-surface-2 p-1">
              {(["open", "resolved", "all"] as DisputeTab[]).map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={query.tab === t}
                  onClick={() => setQuery({ tab: t })}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold capitalize transition-colors",
                    query.tab === t ? "bg-ink text-bg" : "text-ink-muted hover:text-ink",
                  )}
                >
                  {t}
                  <span className={cn("tnum rounded-full px-1.5 text-[10px]", query.tab === t ? "bg-bg/20" : "bg-surface-3")}>{data ? data.counts[t] : "·"}</span>
                </button>
              ))}
            </div>
            <button onClick={() => load(true)} disabled={syncing} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-faint hover:text-accent disabled:opacity-60">
              <RefreshCw className={cn("h-3.5 w-3.5", syncing && "animate-spin")} />
              {data ? `Synced ${new Date(data.syncedAt).toLocaleTimeString()}` : "Sync with chain"}
            </button>
          </div>

          <Toolbar query={query} setQuery={setQuery} />

          {/* Table */}
          <section className="mt-3 overflow-hidden rounded-2xl border border-line bg-surface">
            <TableHead tab={query.tab} />
            {!data ? (
              <ListSkeleton rows={6} />
            ) : data.rows.length === 0 ? (
              <Empty filtered={!!(query.q || query.reason || query.min !== null || query.max !== null)} tab={query.tab} />
            ) : (
              <ul className={cn("divide-y divide-line transition-opacity", loading && "opacity-60")}>
                {data.rows.map((r) =>
                  query.tab === "resolved" ? (
                    <ResolvedRow key={r.chainEscrowId} r={r} onOpen={openRow} active={openId === r.chainEscrowId} />
                  ) : (
                    <QueueRow key={r.chainEscrowId} r={r} onOpen={openRow} active={openId === r.chainEscrowId} />
                  ),
                )}
              </ul>
            )}
            {data && data.total > 0 && <Pager data={data} onPage={(page) => setQuery({ page })} />}
          </section>
        </div>
      </div>

      {openId && (
        <Drawer onClose={closeDrawer} label={`Dispute for escrow #${openId}`}>
          <DisputeDetailView key={openId} id={openId} onClose={closeDrawer} onChanged={() => load()} />
        </Drawer>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Toolbar
// ---------------------------------------------------------------------------

function Toolbar({ query, setQuery }: { query: DisputeQuery; setQuery: (p: Partial<DisputeQuery>) => void }) {
  const [text, setText] = useState(query.q);
  const [min, setMin] = useState(query.min?.toString() ?? "");
  const [max, setMax] = useState(query.max?.toString() ?? "");
  const debounced = useDebounce({ text, min, max }, 350);
  const [filtersOpen, setFiltersOpen] = useState(!!(query.reason || query.min !== null || query.max !== null));

  // Push typed values into the URL once typing settles. setQuery resets to page 1.
  useEffect(() => {
    const toNum = (v: string) => (v.trim() === "" || !Number.isFinite(Number(v)) ? null : Math.max(0, Number(v)));
    const next = { q: debounced.text.trim(), min: toNum(debounced.min), max: toNum(debounced.max) };
    if (next.q !== query.q || next.min !== query.min || next.max !== query.max) setQuery(next);
    // Only the debounced input should trigger this, not query changes from elsewhere.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const active = query.q || query.reason || query.min !== null || query.max !== null || query.sort !== DEFAULT_QUERY.sort;

  return (
    <div className="mt-4 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 basis-60">
          <span className="sr-only">Search disputes</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search item, buyer, seller or escrow #"
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
          />
        </label>
        <label className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-line bg-surface px-3 text-xs font-semibold text-ink-muted">
          <ArrowDownUp className="h-3.5 w-3.5" aria-hidden />
          <span className="sr-only">Sort</span>
          <select value={query.sort} onChange={(e) => setQuery({ sort: e.target.value === "amount" ? "amount" : "oldest" })} className="bg-transparent text-ink focus:outline-none">
            <option value="oldest">Oldest first</option>
            <option value="amount">Biggest amount</option>
          </select>
        </label>
        <button
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          className={cn("inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-bold", filtersOpen ? "border-accent text-accent" : "border-line bg-surface text-ink-muted hover:text-ink")}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" /> Filters
        </button>
        {active && (
          <button
            onClick={() => {
              setText("");
              setMin("");
              setMax("");
              setQuery({ q: "", reason: null, min: null, max: null, sort: DEFAULT_QUERY.sort });
            }}
            className="inline-flex h-10 items-center gap-1 px-2 text-xs font-semibold text-ink-faint hover:text-accent"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>
      {filtersOpen && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-line bg-surface-2 p-2">
          <label className="inline-flex h-9 items-center gap-2 rounded-lg bg-surface px-3 text-xs text-ink-muted">
            Reason
            <select value={query.reason ?? ""} onChange={(e) => setQuery({ reason: e.target.value || null })} className="bg-transparent font-semibold text-ink focus:outline-none">
              <option value="">Any</option>
              {REASONS.map((r) => <option key={r} value={r}>{REASON_LABEL[r]}</option>)}
            </select>
          </label>
          <span className="inline-flex h-9 items-center gap-2 rounded-lg bg-surface px-3 text-xs text-ink-muted">
            Amount
            <input inputMode="decimal" value={min} onChange={(e) => setMin(e.target.value)} placeholder="min" aria-label="Minimum amount in XLM" className="w-16 bg-transparent font-semibold text-ink placeholder:text-ink-faint focus:outline-none" />
            –
            <input inputMode="decimal" value={max} onChange={(e) => setMax(e.target.value)} placeholder="max" aria-label="Maximum amount in XLM" className="w-16 bg-transparent font-semibold text-ink placeholder:text-ink-faint focus:outline-none" />
            XLM
          </span>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

const OPEN_COLS = "md:grid md:grid-cols-[minmax(0,2.4fr)_minmax(0,2fr)_minmax(0,1fr)_minmax(0,1.4fr)_minmax(0,0.8fr)_minmax(0,1.1fr)] md:items-center md:gap-4";
const RESOLVED_COLS = "md:grid md:grid-cols-[minmax(0,2.2fr)_minmax(0,1.8fr)_minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,2fr)_2rem] md:items-center md:gap-4";

function TableHead({ tab }: { tab: DisputeTab }) {
  const cols = tab === "resolved" ? ["Item", "Buyer → seller", "Amount", "Decision", "Internal note", ""] : ["Item", "Buyer → seller", "Amount", "Reason", "Age", "Status"];
  return (
    <div className={cn("hidden border-b border-line bg-surface-2/60 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-ink-faint", tab === "resolved" ? RESOLVED_COLS : OPEN_COLS)}>
      {cols.map((c, i) => <span key={i} className={cn(c === "Amount" && "text-right")}>{c}</span>)}
    </div>
  );
}

function Thumb({ r }: { r: DisputeRow }) {
  return (
    <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-2">
      {r.image ? <Image src={r.image} alt="" fill sizes="40px" className="object-cover" /> : <ListingPlaceholder seed={r.chainEscrowId} category="Order" showLabel={false} />}
    </span>
  );
}

function ItemCell({ r }: { r: DisputeRow }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <Thumb r={r} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold text-ink group-hover:text-accent">{r.productName}</span>
        <span className="block text-[11px] text-ink-faint">#{r.chainEscrowId}{!r.recorded && " · not a recorded order"}</span>
      </span>
    </span>
  );
}

function PartiesCell({ r }: { r: DisputeRow }) {
  return (
    <span className="block truncate text-xs text-ink-muted">
      <span className="font-semibold text-ink">{r.buyerName}</span> → {r.sellerName}
    </span>
  );
}

const AGE_TONE = { normal: "text-ink-muted", amber: "bg-warn-bg text-warn", red: "bg-bad-bg text-bad" };

const STATUS: Record<DisputeRow["status"], { label: string; cls: string }> = {
  open: { label: "Awaiting decision", cls: "bg-bad-bg text-bad" },
  needs_note: { label: "Ruled · needs note", cls: "bg-warn-bg text-warn" },
  refunded: { label: "Refunded", cls: "bg-ok-bg text-ok" },
  released: { label: "Released", cls: "bg-ok-bg text-ok" },
};

function QueueRow({ r, onOpen, active }: { r: DisputeRow; onOpen: (id: string) => void; active: boolean }) {
  const tone = r.status === "open" ? ageTone(r.openedAt) : "normal";
  const status = STATUS[r.status];
  return (
    <li>
      <button
        onClick={() => onOpen(r.chainEscrowId)}
        // Phones: item and amount on one line, parties below, then reason / age / status as one chip row.
        className={cn("group grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1.5 px-4 py-3 text-left transition-colors hover:bg-surface-2 sm:px-5", OPEN_COLS, active && "bg-accent-soft")}
      >
        <ItemCell r={r} />
        <span className="col-span-2 row-start-2 pl-[52px] md:col-span-1 md:row-start-auto md:pl-0"><PartiesCell r={r} /></span>
        <span className="tnum col-start-2 row-start-1 self-center text-sm font-black text-ink md:col-start-auto md:row-start-auto md:text-right">{xlm(stroopsToXlm(r.amountStroops))}</span>
        <span className="col-span-2 flex flex-wrap items-center gap-1.5 pl-[52px] md:contents">
          <span className="truncate text-xs text-ink-muted max-md:rounded-full max-md:bg-surface-2 max-md:px-2 max-md:py-0.5 max-md:text-[11px]">{r.reason ? REASON_LABEL[r.reason] ?? r.reason : "–"}</span>
          <span>
            <span className={cn("tnum inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold", AGE_TONE[tone])} title={r.openedAt ? new Date(r.openedAt).toLocaleString() : undefined}>
              {r.openedAt ? durationLabel(r.openedAt) : "–"}
            </span>
          </span>
          <span>
            <span className={cn("inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold", status.cls)}>{status.label}</span>
          </span>
        </span>
      </button>
    </li>
  );
}

function ResolvedRow({ r, onOpen, active }: { r: DisputeRow; onOpen: (id: string) => void; active: boolean }) {
  return (
    <li className={cn("group flex flex-col gap-1.5 px-4 py-3 transition-colors hover:bg-surface-2 sm:px-5", RESOLVED_COLS, active && "bg-accent-soft")}>
      <button onClick={() => onOpen(r.chainEscrowId)} className="min-w-0 text-left">
        <ItemCell r={r} />
      </button>
      <PartiesCell r={r} />
      <span className="tnum text-sm font-black text-ink md:text-right">{xlm(stroopsToXlm(r.amountStroops))}</span>
      <span className="min-w-0 text-xs">
        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold", STATUS[r.status].cls)}>{r.outcome === "release" ? "Released to seller" : "Refunded to buyer"}</span>
        <span className="mt-0.5 block truncate text-[11px] text-ink-faint">
          {r.adminName ?? "Admin"}{r.resolvedAt && <> · {new Date(r.resolvedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}</>}
        </span>
      </span>
      <span className="line-clamp-2 text-xs text-ink-muted" title={r.note ?? undefined}>{r.note ?? "–"}</span>
      {r.txHash ? (
        <a href={explorerTx(r.txHash)} target="_blank" rel="noreferrer" aria-label={`Ruling transaction for escrow #${r.chainEscrowId}`} className="text-ink-faint hover:text-accent">
          <ExternalLink className="h-4 w-4" />
        </a>
      ) : <span />}
    </li>
  );
}

function Pager({ data, onPage }: { data: DisputeQueue; onPage: (p: number) => void }) {
  const from = (data.page - 1) * PAGE_SIZE + 1;
  const to = from + data.rows.length - 1;
  return (
    <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-ink-muted sm:px-5">
      <span className="tnum">{from}–{to} of {data.total}</span>
      <div className="flex items-center gap-1">
        <button onClick={() => onPage(data.page - 1)} disabled={data.page <= 1} aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:border-accent disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="tnum px-2 font-semibold text-ink">Page {data.page} of {data.pageCount}</span>
        <button onClick={() => onPage(data.page + 1)} disabled={data.page >= data.pageCount} aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-lg border border-line hover:border-accent disabled:opacity-40">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Drawer and bits
// ---------------------------------------------------------------------------

function Drawer({ onClose, label, children }: { onClose: () => void; label: string; children: React.ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      // The confirm dialog inside handles its own Escape.
      if (e.key === "Escape" && !document.getElementById("resolve-title")) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    // Above the fixed navbar (z-50); the confirm dialog inside stacks within this layer.
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className="absolute inset-y-0 right-0 flex w-full flex-col bg-bg shadow-modal outline-none sm:max-w-[880px] sm:border-l sm:border-line"
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface px-4 sm:px-6">
          <p className="flex items-center gap-2 text-sm font-black text-ink"><Gavel className="h-4 w-4 text-accent" /> {label}</p>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-ink-faint hover:bg-surface-2 hover:text-ink">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

/** 9114.5 → "9.1K", so the strip never truncates; the exact figure is in the tooltip. */
const compactXlm = (n: number) => n.toLocaleString(undefined, { notation: "compact", maximumFractionDigits: 1 });

function Stat({ label, value, ember, title }: { label: string; value: string; ember?: boolean; title?: string }) {
  return (
    <div title={title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-sm">
      <dt className="text-[10px] font-bold uppercase tracking-wider text-white/50">{label}</dt>
      <dd className={cn("tnum mt-1 truncate text-lg font-black sm:text-xl", ember ? "lb-ember-text font-display" : "text-white")}>{value}</dd>
    </div>
  );
}

function Banner({ tone, children }: { tone: "bad" | "warn"; children: React.ReactNode }) {
  return (
    <div role="alert" className={cn("mt-4 flex items-center gap-2 rounded-xl border p-3 text-sm", tone === "bad" ? "border-bad-line bg-bad-bg text-bad" : "border-warn-line bg-warn-bg text-warn")}>
      <AlertTriangle className="h-4 w-4 shrink-0" /> {children}
    </div>
  );
}

function Empty({ filtered, tab }: { filtered: boolean; tab: DisputeTab }) {
  return (
    <div className="flex flex-col items-center gap-2 px-5 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ok-bg text-ok">
        <Scale className="h-6 w-6" aria-hidden />
      </span>
      <p className="text-sm font-bold text-ink">{filtered ? "Nothing matches these filters" : tab === "resolved" ? "No disputes resolved yet" : "No open disputes"}</p>
      <p className="max-w-xs text-xs text-ink-muted">
        {filtered ? "Try a different search or clear the filters." : "When a buyer reports a problem, the order shows up here with its money still locked."}
      </p>
    </div>
  );
}
