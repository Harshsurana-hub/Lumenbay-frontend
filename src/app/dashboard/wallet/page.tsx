"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { AlertTriangle, Check, Copy, Droplets, ExternalLink, Loader2, LogOut, RefreshCw, Wallet } from "lucide-react";
import DashboardSubnav from "@/components/dashboard/DashboardSubnav";
import { useWallet } from "@/context/WalletContext";
import { STELLAR, explorerAccount, isTestnet } from "@/lib/stellar/config";
import {
  escrowsForWallet,
  journalSnapshot,
  parseJournal,
  subscribeJournal,
  unfundedEscrows,
  type PaymentEvent,
} from "@/lib/stellar/paymentJournal";

const STEP_LABEL: Record<PaymentEvent["step"], string> = {
  checkout_started: "Checkout started",
  escrow_created: "Awaiting payment",
  escrow_funded: "Funds locked",
  escrow_released: "Completed",
  dispute_opened: "In dispute",
  step_failed: "Last step failed",
};

export default function WalletPage() {
  const wallet = useWallet();
  const [copied, setCopied] = useState(false);
  const [funding, setFunding] = useState(false);
  const rawJournal = useSyncExternalStore(subscribeJournal, journalSnapshot, () => "");
  const { escrows, unfinished } = useMemo(() => {
    if (!wallet.address) return { escrows: [], unfinished: [] };
    const events = parseJournal(rawJournal);
    return {
      escrows: escrowsForWallet(wallet.address, events),
      unfinished: unfundedEscrows(wallet.address, events),
    };
  }, [rawJournal, wallet.address]);

  const copy = async () => {
    if (!wallet.address) return;
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="pt-14">
        <DashboardSubnav title="My Account" />

        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="relative mb-6 overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#0B0807_0%,#3D1712_55%,#8C2A20_100%)] p-6 text-white">
            <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#FF7A59] opacity-30 blur-3xl" />
            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-100/80">
                  <Wallet className="h-4 w-4" /> Stellar wallet {isTestnet && "· Testnet"}
                </span>
                {wallet.address && (
                  <button onClick={() => wallet.refresh()} className="text-orange-100/70 hover:text-white" aria-label="Refresh balance">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>

              {wallet.address ? (
                <>
                  <p className="font-display mt-3 text-4xl font-extrabold tracking-tight tabular-nums">
                    {wallet.balance === null ? "…" : `${wallet.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} XLM`}
                  </p>
                  {wallet.unfunded && <p className="mt-1 text-sm text-orange-100/80">This account isn&apos;t on the network yet. Fund it to start.</p>}
                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                    <span className="flex-1 truncate font-mono text-xs text-orange-50">{wallet.address}</span>
                    <button onClick={copy} className="shrink-0 text-orange-100/80 hover:text-white" aria-label="Copy address">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </>
              ) : (
                <p className="mt-3 text-sm text-orange-100/80">
                  Connect Freighter to pay with escrow and receive payouts. Your address is saved as your payout wallet.
                </p>
              )}
            </div>
          </div>

          {!wallet.networkOk && wallet.address && (
            <Notice>Freighter is on the wrong network. Switch it to {isTestnet ? "Testnet" : "Mainnet"} in the extension, then refresh.</Notice>
          )}
          {wallet.error && <Notice>{wallet.error}</Notice>}

          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {wallet.address ? (
              <>
                {isTestnet && (
                  <ActionTile
                    icon={funding ? <Loader2 className="h-5 w-5 animate-spin" /> : <Droplets className="h-5 w-5" />}
                    label="Get free test XLM"
                    onClick={async () => {
                      setFunding(true);
                      await wallet.fundWithFriendbot();
                      setFunding(false);
                    }}
                  />
                )}
                <ActionTile icon={<ExternalLink className="h-5 w-5" />} label="Full history on explorer" href={explorerAccount(wallet.address)} />
                <ActionTile icon={<LogOut className="h-5 w-5" />} label="Disconnect" onClick={wallet.disconnect} />
              </>
            ) : wallet.installed ? (
              <ActionTile
                icon={wallet.connecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5" />}
                label="Connect Freighter"
                onClick={() => wallet.connect()}
              />
            ) : (
              <ActionTile icon={<ExternalLink className="h-5 w-5" />} label="Install Freighter" href="https://www.freighter.app/" />
            )}
          </div>

          {unfinished.length > 0 && (
            <Notice>
              You have {unfinished.length} unfinished payment{unfinished.length > 1 ? "s" : ""}: an escrow was created but the funds weren&apos;t locked.{" "}
              <Link href={`/dashboard/escrow/${unfinished[0].escrowId}`} className="font-bold underline">Finish it</Link>
            </Notice>
          )}

          <section className="overflow-hidden rounded-2xl border border-line bg-surface">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="text-sm font-black text-ink">Your escrows</h2>
              <span className="text-[11px] text-ink-faint">Recorded in this browser · status on {STELLAR.network}</span>
            </div>
            {escrows.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-muted">No escrows yet. Buy something with escrow and it will show up here.</p>
            ) : (
              <ul className="divide-y divide-line">
                {escrows.map((e) => (
                  <li key={e.escrowId}>
                    <Link href={`/dashboard/escrow/${e.escrowId}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-surface-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-ink">Escrow #{e.escrowId}</p>
                        <p className="text-[11px] text-ink-faint">
                          {e.buyer === wallet.address ? "You bought" : "You sold"} · {new Date(e.at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-ink tabular-nums">{e.amountXlm?.toLocaleString()} XLM</p>
                        <p className={`text-[11px] font-semibold ${e.step === "step_failed" ? "text-bad" : "text-ink-muted"}`}>{STEP_LABEL[e.step]}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-warn-line bg-warn-bg p-3 text-sm text-warn">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}

function ActionTile({ icon, label, onClick, href }: { icon: React.ReactNode; label: string; onClick?: () => void; href?: string }) {
  const cls =
    "group flex flex-col items-center gap-1.5 rounded-2xl border border-line bg-surface py-4 text-ink-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent";
  const body = (
    <>
      {icon}
      <span className="text-xs font-bold">{label}</span>
    </>
  );
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={cls}>{body}</a>
  ) : (
    <button onClick={onClick} className={cls}>{body}</button>
  );
}
