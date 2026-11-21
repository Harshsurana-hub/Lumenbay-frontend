"use client";

import Link from "next/link";
import { Loader2, Wallet } from "lucide-react";
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

  return (
    <Link
      href="/dashboard/wallet"
      title={wallet.networkOk ? "Your Stellar wallet" : "Freighter is on the wrong network"}
      className={`hidden items-center gap-2 rounded-md border px-2.5 py-1 text-xs transition-colors hover:border-accent sm:flex ${
        wallet.networkOk ? "border-line" : "border-warn-line bg-warn-bg"
      }`}
    >
      <span className={`h-2 w-2 rounded-full ${wallet.networkOk ? "bg-ok" : "bg-warn"}`} aria-hidden />
      <span className="font-mono text-ink">{formatAddress(wallet.address)}</span>
      {wallet.balance !== null && (
        <span className="font-semibold tabular-nums text-ink-muted">
          {wallet.balance.toLocaleString(undefined, { maximumFractionDigits: 0 })} XLM
        </span>
      )}
    </Link>
  );
}
