"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Gavel,
  Loader2,
  RefreshCw,
  RotateCcw,
  Scale,
  Send,
  ShieldCheck,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { Panel, xlm } from "@/components/orders/OrderParts";
import { useWallet } from "@/context/WalletContext";
import { fetchDispute, recordPayout, recordResolution } from "@/lib/admin/client";
import {
  NOTE_MAX,
  REASON_LABEL,
  countdownLabel,
  durationLabel,
  mediationBlocks,
  noteProblem,
  payoutFor,
  resolutionCode,
  type DisputeOutcome,
} from "@/lib/admin/disputes";
import type { DisputeDetail } from "@/lib/admin/server";
import { explorerAccount, explorerTx } from "@/lib/stellar/config";
import { EscrowError, cancelMediation, claimDisputedFunds, resolveDispute, stroopsToXlm } from "@/lib/stellar/escrow";
import { cn, formatAddress } from "@/lib/utils";

type Busy = null | "resolve" | "record" | "mediation" | "payout";

/**
 * Everything about one dispute and the decision UI. Rendered inside the
 * queue's side drawer (and full screen on phones); `onChanged` lets the
 * queue refresh its row after a ruling is recorded.
 */
export default function DisputeDetailView({ id, onClose, onChanged }: { id: string; onClose: () => void; onChanged?: () => void }) {
  const wallet = useWallet();
  const [detail, setDetail] = useState<DisputeDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<DisputeOutcome | null>(null);
  const [note, setNote] = useState("");
  const [manualHash, setManualHash] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState<Busy>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setDetail(await fetchDispute(id));
      setLoadError(null);
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : String(e));
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!/^\d+$/.test(id)) return <Shell><p className="text-ink-muted">That isn&apos;t a valid escrow number.</p></Shell>;
  if (loadError && !detail) {
    return (
      <Shell>
        <CloseButton onClose={onClose} />
        <Alert>{loadError}</Alert>
      </Shell>
    );
  }
  if (!detail) {
    return (
      <Shell>
        <CloseButton onClose={onClose} />
        <p className="mt-8 flex items-center gap-2 text-sm text-ink-muted"><Loader2 className="h-4 w-4 animate-spin" /> Reading the dispute from the chain and the database…</p>
      </Shell>
    );
  }

  const s = detail.summary;
  const amount = BigInt(s.amountStroops);
  const amountXlm = stroopsToXlm(amount);
  const disputed = s.chainStatus === "Disputed";
  const chainOutcome: DisputeOutcome | null = s.chainStatus === "Refunded" ? "refund" : s.chainStatus === "Released" ? "release" : null;
  const signer = detail.requiredSigner;
  const walletMatches = !!wallet.address && wallet.address === signer;
  const blockedByMediation = mediationBlocks(detail.mediation, detail.currentLedger);
  const noteError = noteProblem(note);
  const latestRequest = detail.requests.at(-1);

  /** Signs resolve_dispute in Freighter, then has the server verify and record it. */
  const resolve = async () => {
    if (!outcome || !wallet.address) return;
    setBusy("resolve");
    setActionError(null);
    try {
      const { hash } = await resolveDispute(wallet.address, BigInt(id), resolutionCode(outcome));
      setConfirming(false);
      await recordResolution({ chainEscrowId: id, outcome, note, txHash: hash });
      setDone(outcome === "refund" ? "Refund approved on-chain and recorded." : "Release approved on-chain and recorded.");
      onChanged?.();
      await load();
    } catch (e) {
      setActionError(e instanceof EscrowError || e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  /** For a ruling already sent from elsewhere (CLI): record it with its hash and a note. */
  const recordExisting = async () => {
    if (!chainOutcome) return;
    setBusy("record");
    setActionError(null);
    try {
      await recordResolution({ chainEscrowId: id, outcome: chainOutcome, note, txHash: manualHash.trim() });
      setDone("Decision recorded.");
      onChanged?.();
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const endMediation = async () => {
    if (!wallet.address) return;
    setBusy("mediation");
    setActionError(null);
    try {
      await cancelMediation(wallet.address, BigInt(id));
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  const payOut = async () => {
    if (!wallet.address) return;
    setBusy("payout");
    setActionError(null);
    try {
      const { hash } = await claimDisputedFunds(wallet.address, BigInt(id));
      await recordPayout(id, hash).catch(() => {}); // the payout itself is final on-chain
      setDone("Funds paid out.");
      onChanged?.();
      await load();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <CloseButton onClose={onClose} />
        <button onClick={() => load()} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-faint hover:text-accent">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh from chain
        </button>
      </div>

      {/* Hero */}
      <section className="lb-vault lb-grain relative mt-4 overflow-hidden rounded-3xl p-6 sm:p-8">
        <div aria-hidden className="lb-edge-glow absolute inset-x-0 top-0 h-px" />
        <div aria-hidden className="lb-dots absolute inset-0 text-white/[0.05]" />
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFB4A2]">Dispute · Escrow #{id}</p>
            <h1 className="font-display mt-2 truncate text-2xl font-bold tracking-[-0.02em] text-white sm:text-3xl">{s.productName}</h1>
            <p className="font-display lb-ember-text tnum mt-4 text-5xl font-extrabold tracking-[-0.03em]">{xlm(amountXlm)}</p>
            <p className="mt-2 text-xs text-white/60">
              {s.buyerName} bought from {s.sellerName}
              {s.openedAt && <> · disputed {durationLabel(s.openedAt)} ago</>}
            </p>
          </div>
          <StatusPill status={s.chainStatus} />
        </div>
      </section>

      {done && (
        <div role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-ok-line bg-ok-bg p-3 text-sm text-ok">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {done}
        </div>
      )}
      {loadError && <Alert>{loadError}</Alert>}

      <div className="mt-6 grid gap-4 @3xl:grid-cols-[1fr_300px]">
        <div className="flex flex-col gap-4">
          {/* The buyer's case */}
          <Panel title="The buyer's complaint">
            <div className="flex flex-col gap-3 p-5 text-sm">
              <p className="text-base font-bold text-ink">{s.reason ? REASON_LABEL[s.reason] ?? s.reason : "No reason recorded"}</p>
              {detail.disputeNote ? (
                <blockquote className="rounded-xl border border-line bg-surface-2 p-3 text-sm text-ink">
                  <p className="whitespace-pre-wrap break-words">&ldquo;{detail.disputeNote}&rdquo;</p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-ok"><ShieldCheck className="h-3 w-3" /> Matches the fingerprint the buyer put on-chain</p>
                </blockquote>
              ) : (
                <p className="text-xs text-ink-muted">
                  The buyer&apos;s written note wasn&apos;t saved; only its fingerprint is on-chain
                  {latestRequest?.evidenceHash && <> (<span className="font-mono">{latestRequest.evidenceHash.slice(0, 16)}…</span>)</>}. Contact the buyer if you need the details.
                </p>
              )}
              {latestRequest && (
                <p className="text-[11px] text-ink-faint">
                  Refund request #{latestRequest.requestId} for {xlm(stroopsToXlm(latestRequest.amountStroops))} · filed {new Date(latestRequest.createdAt).toLocaleString()} · {latestRequest.status}
                </p>
              )}
            </div>
          </Panel>

          {/* Shipping */}
          <Panel title="Shipping">
            <div className="flex items-start gap-3 p-5">
              <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", s.shippedAt ? "bg-surface-2 text-accent" : "bg-warn-bg text-warn")}>
                <Truck className="h-4 w-4" />
              </span>
              <div className="min-w-0 text-sm">
                {s.shippedAt ? (
                  <>
                    <p className="font-bold text-ink">Seller marked it shipped {new Date(s.shippedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-xs text-ink-muted">{s.shippingNote || "No tracking details were added."}</p>
                  </>
                ) : (
                  <p className="font-bold text-ink">{s.recorded ? "Never marked as shipped" : "Not a recorded order, so there's no shipping record"}</p>
                )}
              </div>
            </div>
          </Panel>

          {/* Decision */}
          {disputed && (
            <Panel title="Your decision">
              <div className="flex flex-col gap-4 p-5">
                <div className="grid gap-3 sm:grid-cols-2">
                  <OutcomeCard
                    selected={outcome === "refund"}
                    onSelect={() => setOutcome("refund")}
                    icon={<RotateCcw className="h-4 w-4" />}
                    title="Refund buyer"
                    body={`${s.buyerName} gets ${xlm(amountXlm)} back. Nothing to the seller.`}
                  />
                  <OutcomeCard
                    selected={outcome === "release"}
                    onSelect={() => setOutcome("release")}
                    icon={<Send className="h-4 w-4" />}
                    title="Release to seller"
                    body={`${s.sellerName} gets about ${xlm(stroopsToXlm(payoutFor("release", amount, detail.feeBps).seller))} after the ${detail.feeBps / 100}% fee.`}
                  />
                </div>
                <p className="flex items-start gap-2 rounded-xl bg-surface-2 p-3 text-xs text-ink-muted">
                  <Scale className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  Splitting the money isn&apos;t available: the contract only lets an admin refund or release in full. A split happens only if buyer and seller both propose the same amount during a mediation window.
                </p>

                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-ink">Internal note <span className="font-normal text-ink-faint">(required, only admins see it)</span></span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={NOTE_MAX}
                    rows={3}
                    placeholder="What you checked and why you decided this way"
                    className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink"
                  />
                </label>

                {blockedByMediation && (
                  <div className="flex flex-col gap-2 rounded-xl border border-warn-line bg-warn-bg p-3 text-xs text-warn">
                    <p>
                      <strong>A mediation window is open</strong> until ledger {detail.mediation?.expiresAt} (now {detail.currentLedger}). The contract won&apos;t accept a ruling until it ends.
                    </p>
                    <button onClick={endMediation} disabled={!walletMatches || !!busy} className="self-start rounded-lg bg-warn px-3 py-1.5 font-bold text-white disabled:opacity-50">
                      {busy === "mediation" ? "Approve in your wallet…" : "End mediation now"}
                    </button>
                  </div>
                )}

                <SignerCheck signer={signer} arbiter={detail.arbiter} address={wallet.address} onConnect={() => wallet.connect()} connecting={wallet.connecting} />

                <button
                  onClick={() => {
                    setActionError(null);
                    setConfirming(true);
                  }}
                  disabled={!outcome || !!noteError || blockedByMediation}
                  className="flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-[#E0483B] to-[#FF7A59] py-3 text-sm font-bold text-white shadow-lg shadow-red-500/25 transition hover:brightness-110 disabled:opacity-50"
                >
                  <Gavel className="h-4 w-4" /> Review decision
                </button>
                {outcome && noteError && note.length > 0 && <p className="text-xs text-bad">{noteError}</p>}
              </div>
            </Panel>
          )}

          {/* Ruled on-chain but not written up */}
          {chainOutcome && !detail.resolution && (
            <Panel title="Record this decision">
              <div className="flex flex-col gap-3 p-5 text-sm">
                <p className="text-ink-muted">
                  This dispute was already settled on-chain as a <strong className="text-ink">{chainOutcome === "refund" ? "refund to the buyer" : "release to the seller"}</strong>, outside the app. Add the transaction and your note for the audit trail.
                </p>
                <input
                  value={manualHash}
                  onChange={(e) => setManualHash(e.target.value)}
                  placeholder="resolve_dispute transaction hash"
                  className="rounded-lg border border-line bg-surface px-3 py-2 font-mono text-xs text-ink"
                />
                <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={NOTE_MAX} rows={3} placeholder="Internal note: what you checked and why" className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink" />
                <button
                  onClick={recordExisting}
                  disabled={!!noteError || !/^[0-9a-fA-F]{64}$/.test(manualHash.trim()) || !!busy}
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-bold text-on-accent disabled:opacity-50"
                >
                  {busy === "record" ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify and record
                </button>
              </div>
            </Panel>
          )}

          {/* Outcome */}
          {chainOutcome && (
            <Panel title="Outcome">
              <div className="flex flex-col gap-3 p-5 text-sm">
                <p className="flex items-center gap-2 text-base font-bold text-ink">
                  <CheckCircle2 className="h-5 w-5 text-ok" />
                  {chainOutcome === "refund" ? `Refunded ${xlm(amountXlm)} to ${s.buyerName}` : `Released to ${s.sellerName}`}
                </p>
                {detail.resolution && (
                  <>
                    <p className="text-xs text-ink-muted">
                      Decided by {detail.resolution.adminName} on {new Date(detail.resolution.createdAt).toLocaleString()} · signed by{" "}
                      <span className="font-mono">{formatAddress(detail.resolution.adminAddress)}</span>
                    </p>
                    <blockquote className="rounded-xl border border-line bg-surface-2 p-3 text-xs text-ink">
                      <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-ink-faint">Internal note</p>
                      <p className="whitespace-pre-wrap break-words">{detail.resolution.note}</p>
                    </blockquote>
                    <a href={explorerTx(detail.resolution.txHash)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-accent">
                      {detail.resolution.txHash.slice(0, 12)}…{detail.resolution.txHash.slice(-6)} <ExternalLink className="h-3 w-3" />
                    </a>
                  </>
                )}
                <PayoutLine detail={detail} onPayOut={payOut} canSign={!!wallet.address} busy={busy === "payout"} />
              </div>
            </Panel>
          )}

          {actionError && <Alert>{actionError}</Alert>}

          <Timeline detail={detail} />
        </div>

        {/* Side: parties */}
        <aside className="flex flex-col gap-4">
          <Panel title="People">
            <dl className="flex flex-col gap-3 p-5 text-sm">
              <Party label="Buyer" name={s.buyerName} address={s.buyerAddress} />
              <Party label="Seller" name={s.sellerName} address={s.sellerAddress} />
              <div>
                <dt className="text-xs text-ink-faint">Contract admin</dt>
                <dd className="font-mono text-xs text-ink">{detail.contractAdmin ? formatAddress(detail.contractAdmin) : "unknown"}</dd>
              </div>
            </dl>
          </Panel>
          <Panel title="Facts">
            <dl className="flex flex-col gap-2 p-5 text-xs">
              <Fact label="Locked">{xlm(amountXlm)}</Fact>
              <Fact label="Open for">{s.openedAt ? durationLabel(s.openedAt) : "unknown"}</Fact>
              <Fact label="On-chain status">{s.chainStatus}</Fact>
              <Fact label="Order">{s.recorded ? "Recorded in Lumenbay" : "Not recorded"}</Fact>
              <Fact label="Mediation">{detail.mediation ? (detail.mediation.concluded ? "Concluded" : `Open until ledger ${detail.mediation.expiresAt}`) : "None opened"}</Fact>
              <Fact label="Ledger now">{detail.currentLedger.toLocaleString()}</Fact>
            </dl>
          </Panel>
        </aside>
      </div>

      {confirming && outcome && (
        <ConfirmDialog
          outcome={outcome}
          detail={detail}
          note={note}
          walletAddress={wallet.address}
          walletMatches={walletMatches}
          busy={busy === "resolve"}
          error={actionError}
          onConnect={() => wallet.connect()}
          onCancel={() => setConfirming(false)}
          onConfirm={resolve}
        />
      )}
    </Shell>
  );
}

// ---------------------------------------------------------------------------
// Pieces
// ---------------------------------------------------------------------------

function SignerCheck({ signer, arbiter, address, onConnect, connecting }: { signer: string | null; arbiter: string | null; address: string | null; onConnect: () => void; connecting: boolean }) {
  if (!address) {
    return (
      <button onClick={onConnect} className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-surface py-2.5 text-sm font-bold text-ink hover:border-accent">
        <Wallet className="h-4 w-4" /> {connecting ? "Connecting…" : "Connect the contract admin wallet"}
      </button>
    );
  }
  if (address !== signer) return <MismatchMessage address={address} signer={signer} arbiter={arbiter} />;
  return (
    <p className="flex items-center gap-2 rounded-xl border border-ok-line bg-ok-bg p-3 text-xs text-ok">
      <ShieldCheck className="h-4 w-4 shrink-0" /> Connected wallet <span className="font-mono">{formatAddress(address)}</span> is the {arbiter ? "arbiter" : "contract admin"}. You can sign this ruling.
    </p>
  );
}

function MismatchMessage({ address, signer, arbiter }: { address: string; signer: string | null; arbiter: string | null }) {
  return (
    <div role="alert" className="flex gap-2 rounded-xl border border-bad-line bg-bad-bg p-3 text-xs text-bad">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <div>
        <p className="font-bold">This wallet can&apos;t sign the ruling</p>
        <p className="mt-1">
          Freighter is connected as <span className="font-mono">{formatAddress(address)}</span>, but this escrow&apos;s {arbiter ? "arbiter" : "contract admin"} is{" "}
          <span className="font-mono">{signer ? formatAddress(signer) : "unknown"}</span>. Switch to that account in Freighter. The contract rejects a ruling from any other wallet.
        </p>
      </div>
    </div>
  );
}

function OutcomeCard({ selected, onSelect, icon, title, body }: { selected: boolean; onSelect: () => void; icon: React.ReactNode; title: string; body: string }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex flex-col gap-1.5 rounded-2xl border p-4 text-left transition",
        selected ? "border-accent bg-accent-soft shadow-md shadow-red-500/10" : "border-line bg-surface hover:border-accent-line",
      )}
    >
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", selected ? "bg-accent text-on-accent" : "bg-surface-2 text-ink-muted")}>{icon}</span>
      <span className="text-sm font-black text-ink">{title}</span>
      <span className="text-xs text-ink-muted">{body}</span>
    </button>
  );
}

function ConfirmDialog({
  outcome,
  detail,
  note,
  walletAddress,
  walletMatches,
  busy,
  error,
  onConnect,
  onCancel,
  onConfirm,
}: {
  outcome: DisputeOutcome;
  detail: DisputeDetail;
  note: string;
  walletAddress: string | null;
  walletMatches: boolean;
  busy: boolean;
  error: string | null;
  onConnect: () => void;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const s = detail.summary;
  const amount = BigInt(s.amountStroops);
  const pay = payoutFor(outcome, amount, detail.feeBps);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onCancel();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [busy, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !busy && onCancel()} />
      <div role="dialog" aria-modal="true" aria-labelledby="resolve-title" className="relative w-full max-w-md overflow-hidden rounded-3xl border border-line bg-surface shadow-modal">
        <div className="lb-vault lb-grain relative p-6">
          <div aria-hidden className="lb-edge-glow absolute inset-x-0 top-0 h-px" />
          <button onClick={onCancel} disabled={busy} className="absolute right-4 top-4 text-white/50 hover:text-white" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#FFB4A2]">Confirm ruling · Escrow #{s.chainEscrowId}</p>
          <h2 id="resolve-title" className="font-display mt-2 text-2xl font-bold text-white">{outcome === "refund" ? "Refund the buyer" : "Release to the seller"}</h2>
        </div>
        <div className="flex flex-col gap-4 p-6">
          <dl className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-4 text-sm">
            <Row label={`${s.buyerName} (buyer)`} value={xlm(stroopsToXlm(pay.buyer))} strong={outcome === "refund"} />
            <Row label={`${s.sellerName} (seller)`} value={`${outcome === "release" ? "≈ " : ""}${xlm(stroopsToXlm(pay.seller))}`} strong={outcome === "release"} />
            {outcome === "release" && <Row label={`Platform fee (${detail.feeBps / 100}%)`} value={`≈ ${xlm(stroopsToXlm(pay.fee))}`} />}
            <div className="my-1 h-px bg-line" />
            <Row label="Total locked" value={xlm(stroopsToXlm(amount))} />
          </dl>
          <p className="flex items-start gap-2 text-xs text-ink-muted">
            <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            The ruling is final once signed. The money moves after the contract&apos;s 24-hour appeal window, when anyone can trigger the payout.
          </p>
          <div className="rounded-xl border border-line p-3 text-xs">
            <p className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">Your internal note</p>
            <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-ink">{note.trim()}</p>
          </div>

          {!walletAddress ? (
            <button onClick={onConnect} className="inline-flex items-center justify-center gap-2 rounded-xl border border-line py-3 text-sm font-bold text-ink hover:border-accent">
              <Wallet className="h-4 w-4" /> Connect the contract admin wallet
            </button>
          ) : !walletMatches ? (
            <MismatchMessage address={walletAddress} signer={detail.requiredSigner} arbiter={detail.arbiter} />
          ) : null}

          {error && <p role="alert" className="text-xs text-bad">{error}</p>}

          <div className="flex gap-2">
            <button onClick={onCancel} disabled={busy} className="flex-1 rounded-xl border border-line py-3 text-sm font-bold text-ink-muted hover:bg-surface-2">
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={busy || !walletMatches}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:opacity-50",
                outcome === "refund" ? "bg-bad" : "bg-linear-to-r from-[#E0483B] to-[#FF7A59]",
              )}
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />}
              {busy ? "Approve in Freighter…" : "Sign with Freighter"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PayoutLine({ detail, onPayOut, canSign, busy }: { detail: DisputeDetail; onPayOut: () => void; canSign: boolean; busy: boolean }) {
  const p = detail.payout;
  if (p.kind === "paid") {
    return <p className="flex items-center gap-2 text-xs font-semibold text-ok"><CheckCircle2 className="h-3.5 w-3.5" /> Funds have been paid out.</p>;
  }
  if (p.kind === "waiting") {
    return (
      <p className="flex items-center gap-2 rounded-xl bg-surface-2 p-3 text-xs text-ink-muted">
        <Clock className="h-3.5 w-3.5 shrink-0" /> Appeal window: funds can be paid out in {countdownLabel(p.secondsLeft)} (after ledger {detail.claimableAt?.toLocaleString()}).
      </p>
    );
  }
  if (p.kind === "claimable") {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-accent-line bg-accent-soft p-3 text-xs text-ink">
        <span>The appeal window has passed. Anyone can now pay the funds out.</span>
        <button onClick={onPayOut} disabled={!canSign || busy} className="rounded-lg bg-accent px-3 py-1.5 font-bold text-on-accent disabled:opacity-50">
          {busy ? "Approve in your wallet…" : "Pay out now"}
        </button>
      </div>
    );
  }
  return null;
}

const ACTOR_LABEL: Record<string, string> = { buyer: "Buyer", seller: "Seller", system: "System", admin: "Admin" };
const TONE_DOT = { ok: "bg-ok", bad: "bg-bad", warn: "bg-warn", muted: "bg-surface-3" };

function Timeline({ detail }: { detail: DisputeDetail }) {
  return (
    <Panel title="Timeline" count={detail.timeline.length}>
      {detail.timeline.length === 0 ? (
        <p className="px-5 py-6 text-xs text-ink-faint">Nothing recorded yet.</p>
      ) : (
        <ol className="flex flex-col gap-0 p-5">
          {detail.timeline.map((t, i) => (
            <li key={`${t.at}-${i}`} className="relative flex gap-3 pb-4 last:pb-0">
              <span className="flex flex-col items-center">
                <span className={cn("mt-1 h-2.5 w-2.5 rounded-full", TONE_DOT[t.tone])} />
                {i < detail.timeline.length - 1 && <span className="mt-1 w-px flex-1 bg-line" />}
              </span>
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-bold text-ink">
                  {t.title} <span className="font-normal text-ink-faint">· {ACTOR_LABEL[t.actor] ?? t.actor}</span>
                </p>
                <p className="text-ink-faint">{new Date(t.at).toLocaleString()}</p>
                {t.detail && <p className="mt-0.5 break-words text-ink-muted">{t.detail}</p>}
                {t.txHash && (
                  <a href={explorerTx(t.txHash)} target="_blank" rel="noreferrer" className="mt-0.5 inline-flex items-center gap-1 font-mono text-accent">
                    {t.txHash.slice(0, 10)}… <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

function Party({ label, name, address }: { label: string; name: string; address: string }) {
  return (
    <div>
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="font-bold text-ink">{name}</dd>
      {address && (
        <a href={explorerAccount(address)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-mono text-xs text-ink-muted hover:text-accent">
          {formatAddress(address)} <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right font-semibold text-ink">{children}</dd>
    </div>
  );
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className={cn("truncate", strong ? "font-bold text-ink" : "text-ink-muted")}>{label}</dt>
      <dd className={cn("tnum shrink-0", strong ? "font-black text-ink" : "font-semibold text-ink-muted")}>{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone = status === "Disputed" ? "bg-bad text-white" : status === "Refunded" || status === "Released" ? "bg-ok text-white" : "bg-white/10 text-white";
  const label = status === "Disputed" ? "Awaiting decision" : status === "Refunded" ? "Refunded" : status === "Released" ? "Released" : status;
  return <span className={cn("rounded-full px-3 py-1 text-sm font-bold", tone)}>{label}</span>;
}

function CloseButton({ onClose }: { onClose: () => void }) {
  return (
    <button onClick={onClose} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-faint hover:text-accent">
      <ArrowLeft className="h-3.5 w-3.5" /> All disputes
    </button>
  );
}

/** Content frame inside the drawer. A size container, so the two-column layout follows the drawer's width, not the window's. */
function Shell({ children }: { children: React.ReactNode }) {
  return <div className="@container px-4 pb-16 pt-4 sm:px-6">{children}</div>;
}

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="mt-4 flex gap-2 rounded-xl border border-bad-line bg-bad-bg p-3 text-sm text-bad">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
