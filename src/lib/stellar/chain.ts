import { Buffer } from "buffer";
import { contract, rpc } from "@stellar/stellar-sdk";
import { STELLAR } from "./config";

/**
 * Read-only access to the escrow contract.
 *
 * No wallet involved, so this runs on the server as well as in the browser.
 * The server uses it to check an order against the chain before writing it
 * to the database: the chain is what holds the money, so it is what we trust.
 */

export type OnChainStatus = "Pending" | "Funded" | "Released" | "Refunded" | "Disputed" | "Cancelled";

export interface OnChainEscrow {
  id: bigint;
  buyer: string;
  seller: string;
  token: string;
  amount: bigint;
  status: OnChainStatus;
  /** The tag the buyer's browser attached at creation, decoded as text. */
  metadata: string | null;
}

let readClient: Promise<contract.Client> | null = null;

function client(): Promise<contract.Client> {
  if (!readClient) {
    readClient = contract.Client.from({
      contractId: STELLAR.escrowContractId,
      networkPassphrase: STELLAR.networkPassphrase,
      rpcUrl: STELLAR.rpcUrl,
    });
    readClient.catch(() => {
      readClient = null;
    });
  }
  return readClient;
}

function decodeMetadata(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  try {
    return Buffer.from(value as Uint8Array).toString("utf8");
  } catch {
    return null;
  }
}

type Assembled = contract.AssembledTransaction<unknown>;

/** Reads one escrow. Free: simulated, never submitted. Null when it doesn't exist. */
export async function readEscrow(escrowId: bigint): Promise<OnChainEscrow | null> {
  const c = (await client()) as unknown as Record<string, (args: Record<string, unknown>) => Promise<Assembled>>;
  const tx = await c.get_escrow({ escrow_id: escrowId });
  const sim = tx.simulation;
  if (sim && rpc.Api.isSimulationError(sim)) {
    // Contract error #10 is "escrow not found".
    if (/Error\(Contract, #10\)/.test(sim.error)) return null;
    throw new Error(sim.error);
  }

  let raw = tx.result as unknown;
  const maybe = raw as { isErr?: () => boolean; unwrap?: () => unknown; unwrapErr?: () => { message?: string } };
  if (maybe && typeof maybe.isErr === "function") {
    if (maybe.isErr()) {
      const message = maybe.unwrapErr?.().message ?? "";
      if (/#10\b|not.?found/i.test(message)) return null;
      throw new Error(message || "Contract error");
    }
    raw = maybe.unwrap?.();
  }
  if (!raw) return null;

  const r = raw as Record<string, unknown>;
  const status = r.status as { tag?: string } | string;
  return {
    id: escrowId,
    buyer: String(r.buyer),
    seller: String(r.seller),
    token: String(r.token),
    amount: BigInt(r.amount as bigint),
    status: (typeof status === "string" ? status : status.tag) as OnChainStatus,
    metadata: decodeMetadata(r.metadata),
  };
}

/**
 * Checks a transaction hash on Horizon: it must exist, have succeeded, and
 * have been sent by `source`. Used so a stored "view on explorer" link is
 * one we've confirmed, not whatever a browser claimed.
 */
export async function isConfirmedTx(hash: string | undefined | null, source: string): Promise<boolean> {
  if (!hash || !/^[0-9a-f]{64}$/i.test(hash)) return false;
  try {
    const res = await fetch(`${STELLAR.horizonUrl}/transactions/${hash}`, { cache: "no-store" });
    if (!res.ok) return false;
    const tx = (await res.json()) as { successful?: boolean; source_account?: string };
    return tx.successful === true && tx.source_account === source;
  } catch {
    return false;
  }
}
