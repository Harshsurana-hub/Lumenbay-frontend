import { Buffer } from "buffer";
import { contract, rpc } from "@stellar/stellar-sdk";
import { readEscrow, type OnChainEscrow } from "./chain";
import { STELLAR } from "./config";
import { signWithFreighter } from "./freighter";

/** 1 XLM = 10,000,000 stroops, the unit contracts work in. */
export const STROOPS_PER_XLM = BigInt(10_000_000);

export function xlmToStroops(xlm: number): bigint {
  return BigInt(Math.round(xlm * Number(STROOPS_PER_XLM)));
}

export function stroopsToXlm(stroops: bigint | number | string): number {
  return Number(BigInt(stroops)) / Number(STROOPS_PER_XLM);
}

export type { OnChainEscrow, OnChainStatus } from "./chain";

export type RefundReason = "ProductNotReceived" | "ProductDefective" | "WrongProduct" | "ChangedMind" | "Other";

/** Plain-English messages for the contract errors a buyer can actually hit. */
const CONTRACT_ERRORS: Record<number, string> = {
  2: "Only the buyer can do that.",
  10: "That escrow doesn't exist on this network.",
  11: "The escrow isn't in the right state for that action.",
  13: "The amount isn't valid.",
  31: "Escrow payments are paused right now. Try again later.",
  70: "An identical escrow already exists. Refresh and try again.",
  91: "This escrow is already funded.",
  164: "That action is switched off at the moment.",
  169: "Payments in this token are paused right now.",
};

export class EscrowError extends Error {
  constructor(message: string, readonly code?: number) {
    super(message);
  }
}

export function toEscrowError(e: unknown): EscrowError {
  if (e instanceof EscrowError) return e;
  const text = e instanceof Error ? e.message : String(e);
  const code = Number(text.match(/Error\(Contract, #(\d+)\)/)?.[1]);
  if (Number.isFinite(code) && code > 0) {
    return new EscrowError(CONTRACT_ERRORS[code] ?? `The contract rejected this (error #${code}).`, code);
  }
  if (/insufficient|underfunded|balance/i.test(text)) {
    return new EscrowError("Your wallet doesn't have enough XLM for this, including network fees.");
  }
  if (/declined|reject/i.test(text)) return new EscrowError("You declined the request in Freighter.");
  return new EscrowError(text || "Something went wrong talking to the Stellar network.");
}

// The client fetches the contract interface from the network, so build it once per signer.
const clients = new Map<string, Promise<contract.Client>>();

function escrowClient(publicKey?: string): Promise<contract.Client> {
  const key = publicKey ?? "read-only";
  let client = clients.get(key);
  if (!client) {
    client = contract.Client.from({
      contractId: STELLAR.escrowContractId,
      networkPassphrase: STELLAR.networkPassphrase,
      rpcUrl: STELLAR.rpcUrl,
      publicKey,
      signTransaction: publicKey ? (xdr, opts) => signWithFreighter(xdr, { ...opts, address: publicKey }) : undefined,
    });
    clients.set(key, client);
    client.catch(() => clients.delete(key));
  }
  return client;
}

type Assembled = contract.AssembledTransaction<unknown>;
type MethodClient = Record<string, (args: Record<string, unknown>) => Promise<Assembled>>;

function unwrap<T>(value: unknown): T {
  const maybe = value as { isErr?: () => boolean; unwrapErr?: () => { message?: string } };
  if (maybe && typeof maybe.isErr === "function") {
    if (maybe.isErr()) throw toEscrowError(new Error(maybe.unwrapErr?.().message ?? "Contract error"));
    return (value as { unwrap: () => T }).unwrap();
  }
  return value as T;
}

/**
 * Throws if the dry run failed. Read from the raw simulation because the SDK's
 * parsed error result drops the contract's numeric error code, which the
 * payment journal needs.
 */
function assertSimulationOk(tx: Assembled) {
  const sim = tx.simulation;
  if (sim && rpc.Api.isSimulationError(sim)) throw toEscrowError(new Error(sim.error));
  unwrap(tx.result);
}

/** Simulates, has Freighter sign, submits and waits for the result. */
async function invoke<T>(signer: string, method: string, args: Record<string, unknown>) {
  try {
    const client = (await escrowClient(signer)) as unknown as MethodClient;
    const tx = await client[method](args);
    assertSimulationOk(tx); // surface contract errors before asking the user to sign
    const sent = await tx.signAndSend();
    const hash = sent.sendTransactionResponse?.hash ?? sent.getTransactionResponse?.txHash ?? "";
    return { result: unwrap<T>(sent.result), hash };
  } catch (e) {
    throw toEscrowError(e);
  }
}

/**
 * Creates the escrow record. `tag` makes each purchase unique: the contract
 * rejects a second escrow with the same buyer, seller and metadata.
 */
export async function createEscrow(params: { buyer: string; seller: string; amountXlm: number; tag: string }) {
  const { result, hash } = await invoke<bigint>(params.buyer, "create_escrow", {
    buyer: params.buyer,
    seller: params.seller,
    token: STELLAR.xlmTokenId,
    amount: xlmToStroops(params.amountXlm),
    metadata: Buffer.from(params.tag, "utf8"),
    arbiter: undefined,
    items: undefined,
    tracking_id: undefined,
  });
  return { escrowId: BigInt(result), hash };
}

/** Moves the buyer's XLM into the contract. */
export function fundEscrow(buyer: string, escrowId: bigint) {
  return invoke<void>(buyer, "fund_escrow", { escrow_id: escrowId });
}

/** Buyer confirms delivery; the contract pays the seller minus the platform fee. */
export function releaseEscrow(buyer: string, escrowId: bigint) {
  return invoke<void>(buyer, "release_escrow", { escrow_id: escrowId });
}

/** Buyer opens a dispute; funds stay locked until the admin or arbiter resolves it. */
export async function openDispute(params: { buyer: string; escrowId: bigint; amountStroops: bigint; reason: RefundReason; note: string }) {
  const evidence = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(params.note)));
  return invoke<bigint>(params.buyer, "refund_escrow", {
    escrow_id: params.escrowId,
    initiator: params.buyer,
    amount: params.amountStroops,
    reason: { tag: params.reason, values: undefined },
    evidence_hash: Buffer.from(evidence),
  });
}

/** Reads an escrow straight from the contract. Free: simulated, never submitted. */
export async function getEscrow(escrowId: bigint): Promise<OnChainEscrow | null> {
  try {
    return await readEscrow(escrowId);
  } catch (e) {
    throw toEscrowError(e);
  }
}
