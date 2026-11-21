"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Gavel,
  Loader2,
  Lock,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { STELLAR, explorerAccount, explorerContract, explorerTx } from "@/lib/stellar/config";
import {
  EscrowError,
  fundEscrow,
  getEscrow,
  openDispute,
  releaseEscrow,
  stroopsToXlm,
  type OnChainEscrow,
  type RefundReason,
} from "@/lib/stellar/escrow";
import { eventsForEscrow, recordPaymentEvent, type PaymentEvent } from "@/lib/stellar/paymentJournal";
import { formatAddress } from "@/lib/utils";

const TRACK = ["Pending", "Funded", "Released"] as const;

const STATUS_COPY: Record<string, { label: string; body: string; tone: string }> = {
  Pending: { label: "Awaiting payment", body: "The escrow exists but no funds are locked yet.", tone: "text-warn" },
  Funded: { label: "Funds locked", body: "The payment is held by the contract. Confirm delivery once the item arrives.", tone: "text-accent" },
  Released: { label: "Completed", body: "Delivery was confirmed and the seller has been paid.", tone: "text-ok" },
  Disputed: { label: "In dispute", body: "Funds stay locked while the dispute is reviewed. The outcome is either a refund or a release.", tone: "text-bad" },
  Refunded: { label: "Refunded", body: "The dispute was resolved in the buyer's favour.", tone: "text-ok" },
  Cancelled: { label: "Cancelled", body: "This escrow was cancelled before it was funded.", tone: "text-ink-muted" },
};

const REASONS: { value: RefundReason; label: string }[] = [
  { value: "ProductNotReceived", label: "Item never arrived" },
  { value: "ProductDefective", label: "Item is damaged or defective" },
  { value: "WrongProduct", label: "Wrong item received" },
  { value: "Other", label: "Something else" },
];

export default function EscrowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const escrowId = /^\d+$/.test(id) ? BigInt(id) : null;
  const wallet = useWallet();

  const [escrow, setEscrow] = useState<OnChainEscrow | null | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [journal, setJournal] = useState<PaymentEvent[]>([]);
  const [busy, setBusy] = useState<null | "fund" | "release" | "dispute">(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [reason, setReason] = useState<RefundReason>("ProductNotReceived");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    if (escrowId === null) return;
    setLoadError(null);
    try {
      setEscrow(await getEscrow(escrowId));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Couldn't read this escrow from the network.");
    }
    setJournal(eventsForEscrow(escrowId.toString()));
  }, [escrowId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (escrowId === null) return <Shell><p className="text-ink-muted">That isn&apos;t a valid escrow number.</p></Shell>;

  const isBuyer = !!escrow && wallet.address === escrow.buyer;
  const isSeller = !!escrow && wallet.address === escrow.seller;
  const amountXlm = escrow ? stroopsToXlm(escrow.amount) : 0;
  const copy = escrow ? STATUS_COPY[escrow.status] ?? STATUS_COPY.Pending : null;

  const run = async (action: "fund" | "release" | "dispute") => {
    if (!escrow || !wallet.address) return;
    setBusy(action);
    setActionError(null);
    const base = {
      escrowId: escrow.id.toString(),
      buyer: escrow.buyer,
      seller: escrow.seller,
      amountXlm,
      network: STELLAR.network,
      contractId: STELLAR.escrowContractId,
    };
    try {
      if (action === "fund") {
        const { hash } = await fundEscrow(wallet.address, escrow.id);
        recordPaymentEvent({ ...base, step: "escrow_funded", txHash: hash });
      } else if (action === "release") {
        const { hash } = await releaseEscrow(wallet.address, escrow.id);
        recordPaymentEvent({ ...base, step: "escrow_released", txHash: hash });
      } else {
        const { hash } = await openDispute({ buyer: wallet.address, escrowId: escrow.id, amountStroops: escrow.amount, reason, note });
        recordPaymentEvent({ ...base, step: "dispute_opened", txHash: hash });
        setDisputeOpen(false);
      }
      await load();
      void wallet.refresh();
    } catch (e) {
      const err = e instanceof EscrowError ? e : new EscrowError(String(e));
      recordPaymentEvent({ ...base, step: "step_failed", failedAction: action, errorCode: err.code, errorMessage: err.message });
      setActionError(err.message);
      setJournal(eventsForEscrow(escrow.id.toString()));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-xs font-semibold text-ink-faint hover:text-accent">
          <ArrowLeft className="h-3.5 w-3.5" /> Orders
        </Link>
        <button onClick={() => load()} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-faint hover:text-accent">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh from chain
        </button>
      </div>

      <header className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-ink-faint">Escrow #{id}</p>
          <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink">
            {escrow ? `${amountXlm.toLocaleString()} XLM` : "Loading…"}
          </h1>
        </div>
        {copy && <span className={`rounded-full bg-surface-2 px-3 py-1 text-sm font-bold ${copy.tone}`}>{copy.label}</span>}
      </header>

      {loadError && <Alert>{loadError}</Alert>}
      {escrow === null && <Alert>No escrow #{id} exists on {STELLAR.network}.</Alert>}

      {escrow && copy && (
        <>
          <Track status={escrow.status} />
          <p className="mt-4 text-sm text-ink-muted">{copy.body}</p>

          <dl className="mt-6 grid grid-cols-1 gap-3 rounded-2xl border border-line bg-surface p-5 text-sm sm:grid-cols-2">
            <Field label="Buyer" value={escrow.buyer} href={explorerAccount(escrow.buyer)} you={isBuyer} />
            <Field label="Seller" value={escrow.seller} href={explorerAccount(escrow.seller)} you={isSeller} />
            <Field label="Contract" value={STELLAR.escrowContractId} href={explorerContract(STELLAR.escrowContractId)} />
            <div>
              <dt className="text-xs text-ink-faint">Seller receives on release</dt>
              <dd className="font-semibold text-ink">{(amountXlm * (1 - STELLAR.feeBps / 10_000)).toLocaleString()} XLM</dd>
            </div>
          </dl>

          {/* Actions */}
          <section className="mt-6 flex flex-col gap-3">
            {!wallet.address && (escrow.status === "Pending" || escrow.status === "Funded") && (
              <button onClick={() => wallet.connect()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-3 text-sm font-bold text-ink hover:border-accent">
                <Wallet className="h-4 w-4" /> Connect the buyer&apos;s wallet to take action
              </button>
            )}

            {isBuyer && escrow.status === "Pending" && (
              <ActionButton onClick={() => run("fund")} busy={busy === "fund"} icon={<Lock className="h-4 w-4" />}>
                Finish payment: lock {amountXlm.toLocaleString()} XLM
              </ActionButton>
            )}

            {isBuyer && escrow.status === "Funded" && !disputeOpen && (
              <>
                <ActionButton onClick={() => run("release")} busy={busy === "release"} icon={<PackageCheck className="h-4 w-4" />}>
                  I received it: release payment to seller
                </ActionButton>
                <button onClick={() => setDisputeOpen(true)} disabled={!!busy} className="inline-flex items-center justify-center gap-2 rounded-xl border border-bad-line py-3 text-sm font-bold text-bad hover:bg-bad-bg">
                  <Gavel className="h-4 w-4" /> There&apos;s a problem: open a dispute
                </button>
              </>
            )}

            {isBuyer && escrow.status === "Funded" && disputeOpen && (
              <div className="flex flex-col gap-3 rounded-2xl border border-bad-line bg-bad-bg/40 p-4">
                <p className="text-sm font-bold text-ink">Open a dispute</p>
                <p className="text-xs text-ink-muted">Funds stay locked until it&apos;s resolved. Only a fingerprint of your note is stored on-chain, not the text.</p>
                <select value={reason} onChange={(e) => setReason(e.target.value as RefundReason)} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink">
                  {REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="What went wrong?" className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink" />
                <div className="flex gap-2">
                  <ActionButton onClick={() => run("dispute")} busy={busy === "dispute"} disabled={note.trim().length < 5} icon={<Gavel className="h-4 w-4" />} tone="bad">
                    Submit dispute
                  </ActionButton>
                  <button onClick={() => setDisputeOpen(false)} disabled={!!busy} className="rounded-xl px-4 text-sm font-semibold text-ink-muted">Cancel</button>
                </div>
              </div>
            )}

            {isSeller && escrow.status === "Funded" && (
              <p className="rounded-xl bg-surface-2 p-4 text-sm text-ink-muted">The buyer&apos;s payment is locked. Ship the item; you&apos;ll be paid automatically when they confirm delivery.</p>
            )}

            {actionError && <Alert>{actionError}</Alert>}
          </section>

          <Journal events={journal} />
        </>
      )}

      {escrow === undefined && !loadError && (
        <p className="mt-8 flex items-center gap-2 text-sm text-ink-muted"><Loader2 className="h-4 w-4 animate-spin" /> Reading escrow from the Stellar network…</p>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <main className="mx-auto max-w-2xl px-4 pb-16 pt-24">{children}</main>
    </div>
  );
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="mt-4 flex gap-2 rounded-xl border border-bad-line bg-bad-bg p-3 text-sm text-bad">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function Track({ status }: { status: string }) {
  const index = TRACK.indexOf(status as (typeof TRACK)[number]);
  const off = index === -1;
  return (
    <ol className="mt-6 grid grid-cols-3 gap-2">
      {TRACK.map((s, i) => {
        const reached = !off && i <= index;
        return (
          <li key={s} className="flex flex-col gap-2">
            <span className={`h-1.5 rounded-full ${reached ? "bg-accent" : "bg-surface-3"}`} />
            <span className={`text-xs font-semibold ${reached ? "text-ink" : "text-ink-faint"}`}>
              {s === "Pending" ? "Created" : s === "Funded" ? "Funds locked" : "Released"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Field({ label, value, href, you }: { label: string; value: string; href: string; you?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-ink-faint">{label}{you && <span className="ml-1 rounded bg-accent-soft px-1 text-[10px] font-bold text-accent">you</span>}</dt>
      <dd>
        <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-ink hover:text-accent">
          {formatAddress(value)} <ExternalLink className="h-3 w-3" />
        </a>
      </dd>
    </div>
  );
}

function ActionButton({
  onClick,
  busy,
  disabled,
  icon,
  tone = "accent",
  children,
}: {
  onClick: () => void;
  busy: boolean;
  disabled?: boolean;
  icon: React.ReactNode;
  tone?: "accent" | "bad";
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy || disabled}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-60 ${
        tone === "bad" ? "bg-bad" : "bg-linear-to-r from-[#E0483B] to-[#FF7A59] shadow-lg shadow-red-500/25"
      }`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
      {busy ? "Waiting for Freighter…" : children}
    </button>
  );
}

const STEP_LABEL: Record<PaymentEvent["step"], string> = {
  checkout_started: "Checkout started",
  escrow_created: "Escrow created",
  escrow_funded: "Funds locked",
  escrow_released: "Released to seller",
  dispute_opened: "Dispute opened",
  step_failed: "Step failed",
};

function Journal({ events }: { events: PaymentEvent[] }) {
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 text-sm font-black text-ink">
        <ShieldCheck className="h-4 w-4 text-accent" /> Payment activity
      </h2>
      {events.length === 0 ? (
        <p className="mt-2 text-xs text-ink-faint">No activity recorded in this browser yet. The on-chain status above is always authoritative.</p>
      ) : (
        <ol className="mt-3 flex flex-col gap-2">
          {[...events].reverse().map((e) => (
            <li key={e.id} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3 text-xs">
              {e.step === "step_failed" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ok" />}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">
                  {STEP_LABEL[e.step]}
                  {e.failedAction && ` (${e.failedAction})`}
                </p>
                <p className="text-ink-faint">{new Date(e.at).toLocaleString()}</p>
                {e.errorMessage && (
                  <p className="mt-1 text-bad">
                    {e.errorMessage}
                    {e.errorCode !== undefined && ` · contract error #${e.errorCode}`}
                  </p>
                )}
                {e.txHash && (
                  <a href={explorerTx(e.txHash)} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 font-mono text-accent">
                    {e.txHash.slice(0, 12)}…{e.txHash.slice(-6)} <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
