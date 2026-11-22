import { Buffer } from "buffer";
import { contract, nativeToScVal, rpc, scValToNative, xdr } from "@stellar/stellar-sdk";
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
  /** Arbiter assigned at creation. When set, only it (not the admin) can resolve a dispute. */
  arbiter: string | null;
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

let rpcServer: rpc.Server | null = null;
const server = () => (rpcServer ??= new rpc.Server(STELLAR.rpcUrl));

function decodeMetadata(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  try {
    return Buffer.from(value as Uint8Array).toString("utf8");
  } catch {
    return null;
  }
}

/** The variant name of a contract enum, however the SDK chose to decode it. */
export function enumTag(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  if (value && typeof value === "object" && typeof (value as { tag?: unknown }).tag === "string") return (value as { tag: string }).tag;
  return null;
}

type Assembled = contract.AssembledTransaction<unknown>;
type Methods = Record<string, (args: Record<string, unknown>) => Promise<Assembled>>;

/** Simulates a read-only call and returns its value, unwrapping Result/Option. */
async function view<T>(method: string, args: Record<string, unknown>): Promise<T | null> {
  const c = (await client()) as unknown as Methods;
  const tx = await c[method](args);
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
  return (raw ?? null) as T | null;
}

function parseEscrow(id: bigint, raw: unknown): OnChainEscrow | null {
  if (!raw) return null;
  const r = raw as Record<string, unknown>;
  return {
    id,
    buyer: String(r.buyer),
    seller: String(r.seller),
    token: String(r.token),
    amount: BigInt(r.amount as bigint),
    status: enumTag(r.status) as OnChainStatus,
    metadata: decodeMetadata(r.metadata),
    arbiter: r.arbiter ? String(r.arbiter) : null,
  };
}

/** Reads one escrow. Free: simulated, never submitted. Null when it doesn't exist. */
export async function readEscrow(escrowId: bigint): Promise<OnChainEscrow | null> {
  return parseEscrow(escrowId, await view("get_escrow", { escrow_id: escrowId }));
}

/** Every escrow in the contract, oldest first. Ids start at 1; pages are capped at 50 by the contract. */
export async function readAllEscrows(): Promise<OnChainEscrow[]> {
  const total = Number((await view<bigint>("get_total_escrows", {})) ?? 0);
  const all: OnChainEscrow[] = [];
  for (let start = 1; start <= total; start += 50) {
    const page = (await view<unknown[]>("get_escrows", { start: BigInt(start), limit: 50 })) ?? [];
    page.forEach((raw, i) => {
      const escrow = parseEscrow(BigInt(start + i), raw);
      if (escrow) all.push(escrow);
    });
  }
  return all;
}

// ---------------------------------------------------------------------------
// Contract storage the contract has no getter for
// ---------------------------------------------------------------------------

/** A `DataKey` variant as the contract stores it: a vec of the variant name and its values. */
function dataKey(variant: string, id?: bigint): xdr.ScVal {
  const parts: xdr.ScVal[] = [xdr.ScVal.scvSymbol(variant)];
  if (id !== undefined) parts.push(nativeToScVal(id, { type: "u64" }));
  return xdr.ScVal.scvVec(parts);
}

async function readStorage<T>(variant: string, id?: bigint): Promise<T | null> {
  let entry: rpc.Api.LedgerEntryResult;
  try {
    entry = await server().getContractData(STELLAR.escrowContractId, dataKey(variant, id), rpc.Durability.Persistent);
  } catch (e) {
    const err = e as { code?: number; message?: string };
    if (err?.code === 404 || /not found/i.test(err?.message ?? String(e))) return null;
    throw e;
  }
  // Depending on the XDR build these are accessor methods or plain fields.
  const holder = entry.val as unknown as { contractData: unknown };
  const data =
    typeof holder.contractData === "function"
      ? (holder.contractData as () => { val: unknown }).call(entry.val)
      : (holder.contractData as { val: unknown });
  const val = typeof data.val === "function" ? (data.val as () => xdr.ScVal).call(data) : (data.val as xdr.ScVal);
  return scValToNative(val) as T;
}

/** The address that must sign `resolve_dispute` for escrows without an arbiter. */
export async function readContractAdmin(): Promise<string | null> {
  const admin = await readStorage<string>("Admin");
  return admin ? String(admin) : null;
}

export interface OnChainRefundRequest {
  requestId: bigint;
  reason: string;
  status: string;
  amount: bigint;
  /** Unix seconds, from the ledger. */
  createdAt: number;
  /** Hex SHA-256 of the buyer's note, as the app submits it. */
  evidenceHash: string | null;
}

/** The buyer's dispute requests for one escrow, oldest first. */
export async function readRefundRequests(escrowId: bigint): Promise<OnChainRefundRequest[]> {
  const ids = (await readStorage<bigint[]>("EscrowRefunds", escrowId)) ?? [];
  const out: OnChainRefundRequest[] = [];
  for (const requestId of ids) {
    const r = await view<Record<string, unknown>>("get_refund_request", { request_id: BigInt(requestId) });
    if (!r) continue;
    const evidence = r.evidence_hash as Uint8Array | null | undefined;
    out.push({
      requestId: BigInt(requestId),
      reason: enumTag(r.reason) ?? "Other",
      status: enumTag(r.status) ?? "Pending",
      amount: BigInt(r.amount as bigint),
      createdAt: Number(r.created_at),
      evidenceHash: evidence ? Buffer.from(evidence).toString("hex") : null,
    });
  }
  return out;
}

export interface OnChainMediation {
  openedAt: number;
  expiresAt: number;
  concluded: boolean;
}

/** The mediation window, if one was opened. While open and unconcluded it blocks `resolve_dispute`. */
export async function readMediation(escrowId: bigint): Promise<OnChainMediation | null> {
  const m = await view<Record<string, unknown>>("get_mediation_phase", { escrow_id: escrowId });
  if (!m) return null;
  return { openedAt: Number(m.opened_at), expiresAt: Number(m.expires_at), concluded: Boolean(m.concluded) };
}

/**
 * Ledger after which a resolved dispute's funds can be paid out with
 * `claim_disputed_funds`. Null before a ruling and after the payout.
 */
export async function readClaimableAt(escrowId: bigint): Promise<number | null> {
  const value = await readStorage<number>("ClaimableAt", escrowId);
  return value === null ? null : Number(value);
}

export async function readLatestLedger(): Promise<number> {
  return (await server().getLatestLedger()).sequence;
}

// ---------------------------------------------------------------------------
// Horizon
// ---------------------------------------------------------------------------

/**
 * Checks a transaction hash on Horizon: it must exist, have succeeded, and
 * have been sent by `source`. Used so a stored "view on explorer" link is
 * one we've confirmed, not whatever a browser claimed.
 */
export async function isConfirmedTx(hash: string | undefined | null, source: string): Promise<boolean> {
  return (await confirmedTxSource(hash)) === source;
}

export interface ContractInvocation {
  source: string;
  contractId: string;
  fn: string;
  args: unknown[];
}

/**
 * The contract call a successful transaction made, decoded from Horizon.
 * Lets the server check that a hash a browser sent is really, say,
 * `resolve_dispute` for this escrow on this contract, not some other tx.
 */
export async function readInvocation(hash: string | undefined | null): Promise<ContractInvocation | null> {
  const source = await confirmedTxSource(hash);
  if (!source) return null;
  try {
    const res = await fetch(`${STELLAR.horizonUrl}/transactions/${hash}/operations?limit=5`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { _embedded?: { records?: { type: string; parameters?: { value: string }[] }[] } };
    const op = body._embedded?.records?.find((r) => r.type === "invoke_host_function" && r.parameters?.length);
    if (!op?.parameters) return null;
    const [contractId, fn, ...args] = op.parameters.map((p) => scValToNative(xdr.ScVal.fromXDR(p.value, "base64")));
    return { source, contractId: String(contractId), fn: String(fn), args };
  } catch {
    return null;
  }
}

/** The source account of a successful transaction, or null if it isn't one. */
export async function confirmedTxSource(hash: string | undefined | null): Promise<string | null> {
  if (!hash || !/^[0-9a-f]{64}$/i.test(hash)) return null;
  try {
    const res = await fetch(`${STELLAR.horizonUrl}/transactions/${hash}`, { cache: "no-store" });
    if (!res.ok) return null;
    const tx = (await res.json()) as { successful?: boolean; source_account?: string };
    return tx.successful === true && tx.source_account ? tx.source_account : null;
  } catch {
    return null;
  }
}
