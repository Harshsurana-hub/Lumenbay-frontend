"use client";

import Link from "next/link";
import { Loader2, Wallet, X } from "lucide-react";
import { useWallet } from "@/context/WalletContext";
import { formatAddress } from "@/lib/utils";

/** Navbar wallet chip: connect prompt, or address + balance linking to the wallet page. */
export default function NavWalletButton() {
  const wallet = useWallet();

  if (!wallet.address) {
    return (
      <button
        onClick={() => wallet.connect()}
        disabled={wallet.connecting}
        className="hidden items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-semibold text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-60 sm:flex"
      >
        {wallet.connecting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wallet className="h-3.5 w-3.5" />}
        Connect wallet
      </button>
    );
  }

  const warn = !wallet.networkOk || wallet.payoutMismatch;
  return (
    <div
      className={`hidden items-center rounded-md border text-xs transition-colors sm:flex ${
        warn ? "border-warn-line bg-warn-bg" : "border-line hover:border-accent"
      }`}
    >
      <Link
        href="/dashboard/wallet"
        title={
          !wallet.networkOk
            ? "Your wallet is on the wrong network"
            : wallet.payoutMismatch
              ? "Connected wallet isn't your payout wallet"
              : "Your Stellar wallet"
        }
        className="flex items-center gap-2 py-1 pl-2.5 pr-1.5"
      >
        <span className={`h-2 w-2 rounded-full ${warn ? "bg-warn" : "bg-ok"}`} aria-hidden />
        <span className="font-mono text-ink">{formatAddress(wallet.address)}</span>
        {wallet.balance !== null && (
          <span className="font-semibold tabular-nums text-ink-muted">
            {wallet.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} XLM
          </span>
        )}
      </Link>
      <button
        onClick={wallet.disconnect}
        className="border-l border-line px-1.5 py-1 text-ink-faint hover:text-bad"
        aria-label="Disconnect wallet"
        title="Disconnect wallet"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
