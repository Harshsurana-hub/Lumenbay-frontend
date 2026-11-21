"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { getPayoutAddress, setPayoutAddress } from "@/lib/listings";
import { STELLAR, isTestnet } from "@/lib/stellar/config";
import {
  connectFreighter,
  getConnectedAddress,
  isFreighterInstalled,
  isOnExpectedNetwork,
} from "@/lib/stellar/freighter";

/** Set when the user disconnects, so we don't silently reconnect on the next visit. */
const DISCONNECTED_KEY = "lumenbay-wallet-disconnected";

interface WalletState {
  address: string | null;
  installed: boolean;
  networkOk: boolean;
  /** XLM balance, or null while unknown. 0 with `unfunded` for brand-new accounts. */
  balance: number | null;
  unfunded: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<string | null>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  fundWithFriendbot: () => Promise<void>;
}

const WalletContext = createContext<WalletState | undefined>(undefined);

async function fetchXlmBalance(address: string): Promise<{ balance: number; unfunded: boolean }> {
  const res = await fetch(`${STELLAR.horizonUrl}/accounts/${address}`);
  if (res.status === 404) return { balance: 0, unfunded: true };
  if (!res.ok) throw new Error("Couldn't load your balance.");
  const data = (await res.json()) as { balances: { asset_type: string; balance: string }[] };
  const native = data.balances.find((b) => b.asset_type === "native");
  return { balance: native ? Number(native.balance) : 0, unfunded: false };
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [address, setAddress] = useState<string | null>(null);
  const [installed, setInstalled] = useState(false);
  const [networkOk, setNetworkOk] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [unfunded, setUnfunded] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [isInstalled, onNetwork] = await Promise.all([isFreighterInstalled(), isOnExpectedNetwork()]);
    setInstalled(isInstalled);
    setNetworkOk(onNetwork);
    if (!address) return;
    try {
      const result = await fetchXlmBalance(address);
      setBalance(result.balance);
      setUnfunded(result.unfunded);
    } catch {
      setBalance(null);
    }
  }, [address]);

  /** Saves the wallet as the signed-in user's payout address, if it isn't already. */
  const linkToProfile = useCallback(
    async (walletAddress: string) => {
      if (!user) return;
      const supabase = createClient();
      const saved = await getPayoutAddress(supabase, user.id);
      if (saved === walletAddress) return;
      try {
        await setPayoutAddress(supabase, user.id, walletAddress);
      } catch (e) {
        const duplicate = /duplicate|unique/i.test(e instanceof Error ? e.message : String(e));
        setError(
          duplicate
            ? "This wallet is already linked to another Lumenbay account. Use a different Freighter account for each Lumenbay login."
            : "Connected, but we couldn't save this wallet to your profile.",
        );
      }
    },
    [user],
  );

  // Reconnect quietly if the user approved this site before and didn't disconnect.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const disconnected = (() => {
        try {
          return localStorage.getItem(DISCONNECTED_KEY) === "1";
        } catch {
          return false;
        }
      })();
      const existing = disconnected ? null : await getConnectedAddress();
      if (cancelled) return;
      setInstalled(await isFreighterInstalled());
      setNetworkOk(await isOnExpectedNetwork());
      if (existing) setAddress(existing);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!address) return;
    void refresh();
    void linkToProfile(address);
  }, [address, refresh, linkToProfile]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const approved = await connectFreighter();
      try {
        localStorage.removeItem(DISCONNECTED_KEY);
      } catch {}
      setAddress(approved);
      setNetworkOk(await isOnExpectedNetwork());
      return approved;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't connect to Freighter.");
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    try {
      localStorage.setItem(DISCONNECTED_KEY, "1");
    } catch {}
    setAddress(null);
    setBalance(null);
    setUnfunded(false);
  }, []);

  const fundWithFriendbot = useCallback(async () => {
    if (!address || !isTestnet) return;
    setError(null);
    const res = await fetch(`https://friendbot.stellar.org/?addr=${encodeURIComponent(address)}`);
    if (!res.ok && res.status !== 400) {
      setError("Friendbot couldn't fund this account. Try again in a minute.");
    }
    await refresh();
  }, [address, refresh]);

  const value = useMemo<WalletState>(
    () => ({ address, installed, networkOk, balance, unfunded, connecting, error, connect, disconnect, refresh, fundWithFriendbot }),
    [address, installed, networkOk, balance, unfunded, connecting, error, connect, disconnect, refresh, fundWithFriendbot],
  );

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used inside WalletProvider");
  return ctx;
}
