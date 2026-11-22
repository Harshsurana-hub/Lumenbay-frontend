"use client";

import type { DisputeDetail, DisputeQueue } from "./server";
import { toSearchParams, type DisputeQuery } from "./disputeQuery";
import type { DisputeOutcome } from "./disputes";

/** Browser calls to the admin routes. The server re-checks the role and the chain on every one. */

export class AdminRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  } catch {
    throw new AdminRequestError("You seem to be offline. Nothing was changed; try again.", 0);
  }
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new AdminRequestError(data.error ?? `Request failed (${res.status}).`, res.status);
  return data;
}

/** One page of the queue. `sync` rescans the contract instead of using the recent scan. */
export function fetchDisputeQueue(query: DisputeQuery, sync = false) {
  const params = toSearchParams(query);
  if (sync) params.set("sync", "1");
  return request<DisputeQueue>(`/api/admin/disputes?${params}`);
}

export const fetchDispute = (chainEscrowId: string) => request<DisputeDetail>(`/api/admin/disputes?id=${encodeURIComponent(chainEscrowId)}`);

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Records a ruling already sent on-chain. Retries a 409 a few times: right
 * after the transaction the RPC can lag the ledger by a few seconds.
 */
export async function recordResolution(input: { chainEscrowId: string; outcome: DisputeOutcome; note: string; txHash: string }) {
  let last: unknown;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      return await request<{ outcome: DisputeOutcome; txHash: string; alreadyRecorded: boolean }>("/api/admin/disputes/resolve", {
        method: "POST",
        body: JSON.stringify(input),
      });
    } catch (e) {
      last = e;
      if (!(e instanceof AdminRequestError) || (e.status !== 409 && e.status !== 422 && e.status < 500)) throw e;
      await sleep(2000 * (attempt + 1));
    }
  }
  throw last;
}

export const recordPayout = (chainEscrowId: string, txHash: string) =>
  request<{ outcome: DisputeOutcome; txHash: string }>("/api/escrows/payout", { method: "POST", body: JSON.stringify({ chainEscrowId, txHash }) });
