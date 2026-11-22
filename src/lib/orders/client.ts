"use client";

/**
 * Browser calls to the order routes. The server re-checks everything against
 * the chain, so these only say which escrow to look at.
 */

export class OrderRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function post<T>(path: string, body: Record<string, unknown>): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new OrderRequestError("You seem to be offline. Your payment is safe on-chain; we'll retry.", 0);
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new OrderRequestError(data.error ?? `Request failed (${res.status}).`, res.status);
  return data;
}

export interface OrderResult {
  orderId: string;
  state: string;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Records a funded escrow as an order. Retries network and server errors a
 * few times, since the money has already moved; a 4xx means the server
 * looked and said no, so retrying wouldn't help.
 */
export async function recordOrder(chainEscrowId: bigint, hashes: { createTxHash?: string; fundTxHash?: string }): Promise<OrderResult> {
  let last: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await post<OrderResult>("/api/escrows/record", { chainEscrowId: chainEscrowId.toString(), ...hashes });
    } catch (e) {
      last = e;
      if (e instanceof OrderRequestError && e.status >= 400 && e.status < 500) throw e;
      await sleep(1000 * 2 ** attempt);
    }
  }
  throw last;
}

/** `disputeNote` right after opening a dispute: kept only if it matches the on-chain fingerprint. */
export function syncOrder(chainEscrowId: bigint, releaseTxHash?: string, disputeNote?: string): Promise<OrderResult> {
  return post<OrderResult>("/api/escrows/sync", { chainEscrowId: chainEscrowId.toString(), releaseTxHash, disputeNote });
}

export function markOrderShipped(chainEscrowId: bigint, note: string): Promise<OrderResult> {
  return post<OrderResult>("/api/escrows/ship", { chainEscrowId: chainEscrowId.toString(), note });
}
