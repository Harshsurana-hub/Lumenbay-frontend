import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createSessionClient } from "@/lib/supabase/server";
import {
  readAllEscrows,
  readClaimableAt,
  readContractAdmin,
  readInvocation,
  readLatestLedger,
  readMediation,
  readRefundRequests,
  type OnChainEscrow,
  type OnChainStatus,
} from "@/lib/stellar/chain";
import { STELLAR } from "@/lib/stellar/config";
import { parseOrderTag } from "@/lib/orderTag";
import {
  OrderApiError,
  applyChainState,
  dbError,
  findEscrowRow,
  notify,
  readChain,
  type Admin,
  type EscrowRow,
} from "@/lib/orders/server";
import type { DbEscrowState } from "@/lib/orders/escrowState";
import {
  buildTimeline,
  invocationMatches,
  isDisputeOutcome,
  noteProblem,
  outcomeFromChain,
  payoutState,
  resolutionCode,
  sortTimeline,
  type DisputeOutcome,
  type PayoutState,
  type TimelineEntry,
} from "./disputes";
import { queryRows, summarize, type DisputePage, type DisputeQuery, type DisputeRow, type QueueSummary, type RowStatus } from "./disputeQuery";

/**
 * Server side of dispute resolution. Who is an admin is read from
 * `profiles.role` with the service role on every request, never from the
 * session's metadata, which the user can write.
 */

export interface AdminSession {
  userId: string;
  displayName: string;
}

/** The signed-in admin, or null for anyone else (signed out included). For pages. */
export async function getAdminSession(): Promise<AdminSession | null> {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const { data: profile, error } = await createAdminClient()
    .from("profiles")
    .select("role, display_name")
    .eq("id", data.user.id)
    .maybeSingle();
  if (error) {
    console.error("[lumenbay:admin] role check failed", error);
    return null;
  }
  if (profile?.role !== "ADMIN") return null;
  return { userId: data.user.id, displayName: profile.display_name ?? "Admin" };
}

/** For API routes: throws 401/403 unless the caller is an admin. */
export async function requireAdmin(): Promise<AdminSession> {
  const supabase = await createSessionClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new OrderApiError(401, "Sign in again to continue.");
  const session = await getAdminSession();
  if (!session) throw new OrderApiError(403, "Only Lumenbay admins can do that.");
  return session;
}

// ---------------------------------------------------------------------------
// Shapes the admin pages read
// ---------------------------------------------------------------------------

export interface DisputeSummary {
  chainEscrowId: string;
  /** False for a disputed escrow on-chain that was never recorded as an order. */
  recorded: boolean;
  state: DbEscrowState | null;
  chainStatus: OnChainStatus;
  productName: string;
  productId: string | null;
  buyerName: string;
  sellerName: string;
  buyerAddress: string;
  sellerAddress: string;
  amountStroops: string;
  openedAt: string | null;
  shippedAt: string | null;
  shippingNote: string | null;
  reason: string | null;
}

export interface DisputeQueue extends DisputePage {
  summary: QueueSummary;
  syncedAt: string;
  chainError: string | null;
}

export interface DisputeDetail {
  summary: DisputeSummary;
  contractAdmin: string | null;
  /** Who must sign resolve_dispute: the escrow's arbiter if it has one, else the contract admin. */
  requiredSigner: string | null;
  arbiter: string | null;
  feeBps: number;
  currentLedger: number;
  requests: { requestId: string; reason: string; status: string; amountStroops: string; createdAt: string; evidenceHash: string | null }[];
  /** The buyer's note; only ever stored after matching the on-chain fingerprint. */
  disputeNote: string | null;
  /** While open and not concluded, it blocks resolve_dispute. */
  mediation: { expiresAt: number; concluded: boolean } | null;
  claimableAt: number | null;
  payout: PayoutState;
  resolution: {
    outcome: DisputeOutcome;
    note: string;
    adminName: string;
    adminAddress: string;
    txHash: string;
    createdAt: string;
  } | null;
  timeline: TimelineEntry[];
}

interface DbDisputeRow extends EscrowRow {
  buyer_address: string | null;
  seller_address: string | null;
  amount_stroops: string | null;
  shipped_at: string | null;
  shipping_note: string | null;
  dispute_reason: string | null;
  dispute_note: string | null;
  disputed_at: string | null;
  created_at: string;
  resolution: DisputeOutcome | null;
  resolved_at: string | null;
  orders: One<{ product_id: string; products: One<{ product_images: { url: string; position: number }[] | null }> }>;
  buyer: { display_name: string | null } | { display_name: string | null }[] | null;
  seller: { display_name: string | null } | { display_name: string | null }[] | null;
}

type One<T> = T | T[] | null;
const one = <T,>(v: One<T>): T | null => (Array.isArray(v) ? v[0] ?? null : v);

const DISPUTE_COLUMNS = `
  id, order_id, buyer_id, seller_id, asset_name, price_xlm, current_state, chain_escrow_id,
  buyer_address, seller_address, amount_stroops, shipped_at, shipping_note,
  dispute_reason, dispute_note, disputed_at, created_at, resolution, resolved_at,
  orders ( product_id, products ( product_images ( url, position ) ) ),
  buyer:profiles!escrows_buyer_id_fkey ( display_name ),
  seller:profiles!escrows_seller_id_fkey ( display_name )
`;

function summaryFromRow(row: DbDisputeRow, chain: OnChainEscrow | null): DisputeSummary {
  return {
    chainEscrowId: String(row.chain_escrow_id),
    recorded: true,
    state: row.current_state,
    chainStatus: chain?.status ?? "Disputed",
    productName: row.asset_name,
    productId: one(row.orders)?.product_id ?? null,
    buyerName: one(row.buyer)?.display_name ?? "Buyer",
    sellerName: one(row.seller)?.display_name ?? "Seller",
    buyerAddress: row.buyer_address ?? chain?.buyer ?? "",
    sellerAddress: row.seller_address ?? chain?.seller ?? "",
    amountStroops: (chain?.amount ?? BigInt(row.amount_stroops ?? 0)).toString(),
    openedAt: row.disputed_at,
    shippedAt: row.shipped_at,
    shippingNote: row.shipping_note,
    reason: row.dispute_reason,
  };
}

async function namesByAddress(admin: Admin, addresses: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(addresses.filter(Boolean))];
  if (!unique.length) return new Map();
  const { data } = await admin.from("profiles").select("stellar_address, display_name").in("stellar_address", unique);
  return new Map((data ?? []).map((p) => [p.stellar_address as string, (p.display_name as string) ?? ""]));
}

async function productName(admin: Admin, productId: string | null): Promise<string | null> {
  if (!productId) return null;
  const { data } = await admin.from("products").select("name").eq("id", productId).maybeSingle();
  return (data?.name as string) ?? null;
}

async function summaryFromChain(admin: Admin, chain: OnChainEscrow, names: Map<string, string>): Promise<DisputeSummary> {
  const tag = parseOrderTag(chain.metadata);
  const requests = await readRefundRequests(chain.id).catch(() => []);
  const last = requests.at(-1);
  return {
    chainEscrowId: chain.id.toString(),
    recorded: false,
    state: null,
    chainStatus: chain.status,
    productName: (await productName(admin, tag?.productId ?? null)) ?? (chain.metadata ? `Untracked escrow (${chain.metadata.slice(0, 40)})` : "Untracked escrow"),
    productId: tag?.productId ?? null,
    buyerName: names.get(chain.buyer) || "Unknown buyer",
    sellerName: names.get(chain.seller) || "Unknown seller",
    buyerAddress: chain.buyer,
    sellerAddress: chain.seller,
    amountStroops: chain.amount.toString(),
    openedAt: last ? new Date(last.createdAt * 1000).toISOString() : null,
    shippedAt: null,
    shippingNote: null,
    reason: last?.reason ?? null,
  };
}

// ---------------------------------------------------------------------------
// Queue
// ---------------------------------------------------------------------------

/** One contract scan is shared by requests for a short while; "Sync with chain" forces a fresh one. */
const SCAN_TTL_MS = 30_000;
let scanCache: { at: number; escrows: OnChainEscrow[] } | null = null;

async function scanChain(force: boolean): Promise<{ escrows: OnChainEscrow[]; fresh: boolean }> {
  if (!force && scanCache && Date.now() - scanCache.at < SCAN_TTL_MS) return { escrows: scanCache.escrows, fresh: false };
  const escrows = await readAllEscrows();
  scanCache = { at: Date.now(), escrows };
  return { escrows, fresh: true };
}

function firstImage(row: DbDisputeRow): string | null {
  const images = one(one(row.orders)?.products ?? null)?.product_images ?? [];
  return [...images].sort((a, b) => a.position - b.position)[0]?.url ?? null;
}

function rowFromDb(row: DbDisputeRow, chain: OnChainEscrow | null, status: RowStatus): DisputeRow {
  const s = summaryFromRow(row, chain);
  return {
    chainEscrowId: s.chainEscrowId,
    status,
    recorded: true,
    productName: s.productName,
    image: firstImage(row),
    buyerName: s.buyerName,
    sellerName: s.sellerName,
    amountStroops: s.amountStroops,
    reason: s.reason,
    openedAt: s.openedAt,
    shippedAt: s.shippedAt,
    outcome: row.resolution,
    resolvedAt: row.resolved_at,
    adminName: null,
    note: null,
    txHash: null,
  };
}

/**
 * Every dispute as queue rows: open ones (recorded and chain-only), rulings
 * made outside the app that still need a note, and resolved ones. Rows the
 * chain has moved on are synced first.
 */
async function collectRows(force: boolean): Promise<{ rows: DisputeRow[]; chainError: string | null }> {
  const admin = createAdminClient();

  let chainEscrows: OnChainEscrow[] = [];
  let chainError: string | null = null;
  let fresh = false;
  try {
    ({ escrows: chainEscrows, fresh } = await scanChain(force));
  } catch (e) {
    console.error("[lumenbay:admin] chain scan failed", e);
    chainError = "Couldn't scan the contract right now; showing what the database knows.";
  }
  const byId = new Map(chainEscrows.map((e) => [e.id.toString(), e]));

  // Sync recorded escrows whose chain status says they're in or past a dispute.
  const interesting = fresh ? chainEscrows.filter((e) => e.status === "Disputed" || e.status === "Refunded" || e.status === "Released") : [];
  if (interesting.length) {
    const { data, error } = await admin
      .from("escrows")
      .select("id, order_id, buyer_id, seller_id, asset_name, price_xlm, current_state, chain_escrow_id")
      .eq("contract_id", STELLAR.escrowContractId)
      .in("chain_escrow_id", interesting.map((e) => e.id.toString()));
    if (error) throw dbError("load escrows to sync", error);
    for (const row of (data ?? []) as EscrowRow[]) {
      const chain = byId.get(String(row.chain_escrow_id));
      if (chain) await applyChainState(admin, row, chain).catch((e) => console.error("[lumenbay:admin] sync failed", { id: row.chain_escrow_id, e: String(e) }));
    }
  }

  // Open disputes, and rulings (resolution set) — the resolved ones are joined to their write-up below.
  const { data: dbRows, error } = await admin
    .from("escrows")
    .select(DISPUTE_COLUMNS)
    .eq("contract_id", STELLAR.escrowContractId)
    .or("current_state.eq.disputed,resolution.not.is.null")
    .limit(5000);
  if (error) throw dbError("load disputes", error);
  const recorded = (dbRows ?? []) as unknown as DbDisputeRow[];
  const recordedById = new Map(recorded.map((r) => [String(r.chain_escrow_id), r]));

  const { data: resolutions, error: resError } = await admin
    .from("dispute_resolutions")
    .select("chain_escrow_id, outcome, amount_stroops, note, tx_hash, created_at, admin:profiles!dispute_resolutions_admin_id_fkey ( display_name )")
    .eq("contract_id", STELLAR.escrowContractId)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (resError) throw dbError("load resolutions", resError);
  const writtenUp = new Set((resolutions ?? []).map((r) => String(r.chain_escrow_id)));

  const rows: DisputeRow[] = [];
  for (const r of recorded) {
    const id = String(r.chain_escrow_id);
    if (r.current_state === "disputed") rows.push(rowFromDb(r, byId.get(id) ?? null, "open"));
    else if (!writtenUp.has(id)) rows.push(rowFromDb(r, byId.get(id) ?? null, "needs_note"));
  }

  for (const res of resolutions ?? []) {
    const id = String(res.chain_escrow_id);
    const db = recordedById.get(id);
    const base: DisputeRow = db
      ? rowFromDb(db, byId.get(id) ?? null, "refunded")
      : {
          chainEscrowId: id, status: "refunded", recorded: false, productName: `Escrow #${id}`, image: null,
          buyerName: "Unknown buyer", sellerName: "Unknown seller", amountStroops: String(res.amount_stroops),
          reason: null, openedAt: null, shippedAt: null, outcome: null, resolvedAt: null, adminName: null, note: null, txHash: null,
        };
    rows.push({
      ...base,
      status: res.outcome === "refund" ? "refunded" : "released",
      outcome: res.outcome as DisputeOutcome,
      resolvedAt: res.created_at as string,
      adminName: one(res.admin as One<{ display_name: string | null }>)?.display_name ?? "Admin",
      note: res.note as string,
      txHash: res.tx_hash as string,
    });
  }

  // Disputes on-chain that never became orders.
  const recordedIds = new Set(recorded.map((r) => String(r.chain_escrow_id)));
  if (chainEscrows.length) {
    const { data } = await admin
      .from("escrows")
      .select("chain_escrow_id")
      .eq("contract_id", STELLAR.escrowContractId)
      .in("chain_escrow_id", chainEscrows.filter((e) => e.status === "Disputed").map((e) => e.id.toString()).concat("0"));
    for (const r of data ?? []) recordedIds.add(String(r.chain_escrow_id));
  }
  const chainOnly = chainEscrows.filter((e) => e.status === "Disputed" && !recordedIds.has(e.id.toString()));
  const names = await namesByAddress(admin, chainOnly.flatMap((e) => [e.buyer, e.seller]));
  for (const s of await Promise.all(chainOnly.map((e) => summaryFromChain(admin, e, names)))) {
    rows.push({
      chainEscrowId: s.chainEscrowId, status: "open", recorded: false, productName: s.productName, image: null,
      buyerName: s.buyerName, sellerName: s.sellerName, amountStroops: s.amountStroops, reason: s.reason,
      openedAt: s.openedAt, shippedAt: null, outcome: null, resolvedAt: null, adminName: null, note: null, txHash: null,
    });
  }

  return { rows, chainError };
}

/** One page of the disputes queue, with tab counts and the summary strip, for a URL query. */
export async function listDisputeQueue(query: DisputeQuery, opts: { sync?: boolean } = {}): Promise<DisputeQueue> {
  const { rows, chainError } = await collectRows(!!opts.sync);
  return { ...queryRows(rows, query), summary: summarize(rows), syncedAt: new Date(scanCache?.at ?? Date.now()).toISOString(), chainError };
}

// ---------------------------------------------------------------------------
// Detail
// ---------------------------------------------------------------------------

export async function getDispute(id: bigint): Promise<DisputeDetail> {
  const admin = createAdminClient();
  const chain = await readChain(id);

  // Bring the row up to date first, so the page shows what the chain shows.
  const base = await findEscrowRow(admin, id);
  if (base) await applyChainState(admin, base, chain).catch((e) => console.error("[lumenbay:admin] sync failed", String(e)));

  const { data: rowData, error } = await admin
    .from("escrows")
    .select(DISPUTE_COLUMNS)
    .eq("contract_id", STELLAR.escrowContractId)
    .eq("chain_escrow_id", id.toString())
    .maybeSingle();
  if (error) throw dbError("load dispute", error);
  const row = rowData as unknown as DbDisputeRow | null;

  const [contractAdmin, currentLedger, requests, mediation, claimableAt] = await Promise.all([
    readContractAdmin(),
    readLatestLedger(),
    readRefundRequests(id).catch(() => []),
    readMediation(id).catch(() => null),
    readClaimableAt(id).catch(() => null),
  ]);

  let summary: DisputeSummary;
  if (row) {
    summary = summaryFromRow(row, chain);
    summary.reason ??= requests.at(-1)?.reason ?? null;
    if (!summary.openedAt && requests.length) summary.openedAt = new Date(requests.at(-1)!.createdAt * 1000).toISOString();
  } else {
    summary = await summaryFromChain(admin, chain, await namesByAddress(admin, [chain.buyer, chain.seller]));
  }
  const { data: res } = await admin
    .from("dispute_resolutions")
    .select("outcome, note, admin_address, tx_hash, created_at, admin:profiles!dispute_resolutions_admin_id_fkey ( display_name )")
    .eq("contract_id", STELLAR.escrowContractId)
    .eq("chain_escrow_id", id.toString())
    .maybeSingle();

  // Every dispute leaves a refund request on-chain; without one this is an ordinary escrow.
  if (chain.status !== "Disputed" && !requests.length && !res) throw new OrderApiError(404, `Escrow #${id} was never in dispute.`);

  // Timeline: state changes plus the payment steps anyone logged for this escrow.
  const [{ data: events }, { data: payments }] = await Promise.all([
    row ? admin.from("escrow_events").select("state, label, actor, description, created_at").eq("escrow_id", row.id).order("created_at") : Promise.resolve({ data: [] }),
    admin
      .from("payment_events")
      .select("user_id, step, failed_action, tx_hash, error_message, created_at, client_at")
      .eq("contract_id", STELLAR.escrowContractId)
      .eq("chain_escrow_id", id.toString())
      .order("created_at")
      .limit(200),
  ]);
  const actorOf = (userId: string) => (row && userId === row.buyer_id ? "buyer" : row && userId === row.seller_id ? "seller" : "admin");
  const timeline = buildTimeline(
    (events ?? []) as { state: string; label: string; actor: string; description: string | null; created_at: string }[],
    ((payments ?? []) as { user_id: string; step: string; failed_action: string | null; tx_hash: string | null; error_message: string | null; created_at: string; client_at: string | null }[]).map((p) => ({ ...p, actor: actorOf(p.user_id) })),
  );
  // Chain facts the database may not have seen.
  for (const r of requests) {
    timeline.push({ at: new Date(r.createdAt * 1000).toISOString(), title: "Dispute filed on-chain", detail: `Refund request #${r.requestId} · ${r.status}`, actor: "buyer", tone: "bad" });
  }
  sortTimeline(timeline);

  const outcome = outcomeFromChain(chain.status);
  const resolved = !!outcome && (requests.length > 0 || !!res || !!row?.dispute_reason);

  return {
    summary,
    contractAdmin,
    requiredSigner: chain.arbiter ?? contractAdmin,
    arbiter: chain.arbiter,
    feeBps: STELLAR.feeBps,
    currentLedger,
    requests: requests.map((r) => ({
      requestId: r.requestId.toString(),
      reason: r.reason,
      status: r.status,
      amountStroops: r.amount.toString(),
      createdAt: new Date(r.createdAt * 1000).toISOString(),
      evidenceHash: r.evidenceHash,
    })),
    disputeNote: row?.dispute_note ?? null,
    mediation,
    claimableAt,
    payout: payoutState({ resolved, claimableAt, currentLedger }),
    resolution: res
      ? {
          outcome: res.outcome as DisputeOutcome,
          note: res.note as string,
          adminName: one(res.admin as { display_name: string | null } | { display_name: string | null }[] | null)?.display_name ?? "Admin",
          adminAddress: res.admin_address as string,
          txHash: res.tx_hash as string,
          createdAt: res.created_at as string,
        }
      : null,
    timeline,
  };
}

// ---------------------------------------------------------------------------
// Resolve: record a ruling the admin already signed on-chain
// ---------------------------------------------------------------------------

/**
 * Called after the admin's `resolve_dispute` transaction. Trusts nothing the
 * browser says beyond which escrow and which hash: the outcome is read from
 * the chain, and the hash must be a successful `resolve_dispute` call on this
 * contract, for this escrow, with this outcome, sent by the required signer.
 */
export async function recordResolution(session: AdminSession, id: bigint, input: { outcome: unknown; note: unknown; txHash: unknown }) {
  if (!isDisputeOutcome(input.outcome)) throw new OrderApiError(400, "Choose an outcome: refund the buyer or release to the seller.");
  const problem = noteProblem(input.note);
  if (problem) throw new OrderApiError(400, problem);
  const note = (input.note as string).trim();
  const txHash = typeof input.txHash === "string" ? input.txHash.trim().toLowerCase() : "";
  if (!/^[0-9a-f]{64}$/.test(txHash)) throw new OrderApiError(400, "That isn't a valid transaction hash.");

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("dispute_resolutions")
    .select("outcome, tx_hash")
    .eq("contract_id", STELLAR.escrowContractId)
    .eq("chain_escrow_id", id.toString())
    .maybeSingle();
  if (existing) return { outcome: existing.outcome as DisputeOutcome, txHash: existing.tx_hash as string, alreadyRecorded: true };

  const chain = await readChain(id);
  if (chain.status === "Disputed") {
    throw new OrderApiError(409, "The chain still shows this escrow as disputed. Wait a few seconds for the transaction to confirm, then try again.");
  }
  const onChain = outcomeFromChain(chain.status);
  if (!onChain) throw new OrderApiError(409, `This escrow is ${chain.status.toLowerCase()} on-chain, not resolved.`);
  if (onChain !== input.outcome) {
    throw new OrderApiError(409, `The chain shows this dispute was settled as a ${onChain === "refund" ? "refund to the buyer" : "release to the seller"}, not what you chose.`);
  }

  const contractAdmin = await readContractAdmin();
  const signer = chain.arbiter ?? contractAdmin;
  const invocation = await readInvocation(txHash);
  if (!invocation || invocation.source !== signer) {
    throw new OrderApiError(422, "We couldn't confirm that transaction on the network as sent by the contract admin.");
  }
  if (!invocationMatches(invocation, { contractId: STELLAR.escrowContractId, fn: "resolve_dispute", escrowId: id, resolution: resolutionCode(onChain) })) {
    throw new OrderApiError(422, "That transaction isn't this escrow's resolve_dispute call.");
  }

  const claimableAt = await readClaimableAt(id).catch(() => null);
  const now = new Date().toISOString();

  const row = await findEscrowRow(admin, id);
  if (row) {
    // Moves the state, updates the order and notifies both parties, unless a sync already did.
    await applyChainState(admin, row, chain);
    const { error } = await admin
      .from("escrows")
      .update({ resolution: onChain, resolved_at: now, resolve_tx_hash: txHash, claimable_at_ledger: claimableAt })
      .eq("id", row.id);
    if (error) throw dbError("save resolution on escrow", error);
  }

  const { error: insertError } = await admin.from("dispute_resolutions").insert({
    escrow_id: row?.id ?? null,
    network: STELLAR.network,
    contract_id: STELLAR.escrowContractId,
    chain_escrow_id: id.toString(),
    admin_id: session.userId,
    admin_address: invocation.source,
    outcome: onChain,
    amount_stroops: chain.amount.toString(),
    note,
    tx_hash: txHash,
    claimable_at_ledger: claimableAt,
  });
  if (insertError) {
    if (insertError.code === "23505") return { outcome: onChain, txHash, alreadyRecorded: true }; // a concurrent retry won
    throw dbError("insert resolution", insertError);
  }

  const summary = onChain === "refund" ? "full refund to the buyer" : "payment released to the seller";
  if (row) {
    await admin.from("escrow_events").insert({
      escrow_id: row.id,
      state: onChain === "refund" ? "refunded" : "released",
      label: onChain === "refund" ? "Dispute resolved: refunded" : "Dispute resolved: released",
      actor: "admin",
      description: `A Lumenbay admin resolved the dispute: ${summary}. Funds can be paid out after the 24-hour appeal window${claimableAt ? ` (ledger ${claimableAt})` : ""}.`,
    });
  }

  await admin.from("payment_events").insert({
    user_id: session.userId,
    step: "dispute_resolved",
    network: STELLAR.network,
    contract_id: STELLAR.escrowContractId,
    chain_escrow_id: id.toString(),
    buyer_address: chain.buyer,
    seller_address: chain.seller,
    tx_hash: txHash,
    client_at: now,
  });

  console.info("[lumenbay:admin] dispute resolved", { escrow: id.toString(), outcome: onChain, admin: session.userId, tx: txHash });
  return { outcome: onChain, txHash, alreadyRecorded: false };
}

// ---------------------------------------------------------------------------
// Payout: after the appeal window, claim_disputed_funds moved the money
// ---------------------------------------------------------------------------

/** Records a `claim_disputed_funds` payout. Open to both parties and admins; anyone may send that call. */
export async function recordPayout(userId: string, id: bigint, txHashInput: unknown) {
  const txHash = typeof txHashInput === "string" ? txHashInput.trim().toLowerCase() : "";
  if (!/^[0-9a-f]{64}$/.test(txHash)) throw new OrderApiError(400, "That isn't a valid transaction hash.");

  const admin = createAdminClient();
  const row = await findEscrowRow(admin, id);
  if (row && row.buyer_id !== userId && row.seller_id !== userId && !(await isAdminUser(admin, userId))) {
    throw new OrderApiError(403, "This order belongs to someone else.");
  }
  if (!row && !(await isAdminUser(admin, userId))) throw new OrderApiError(404, "This order hasn't been recorded yet.");

  const chain = await readChain(id);
  const outcome = outcomeFromChain(chain.status);
  if (!outcome) throw new OrderApiError(409, "This escrow hasn't been resolved.");
  if ((await readClaimableAt(id)) !== null) throw new OrderApiError(409, "The funds haven't been paid out on-chain yet.");
  const invocation = await readInvocation(txHash);
  if (!invocationMatches(invocation, { contractId: STELLAR.escrowContractId, fn: "claim_disputed_funds", escrowId: id })) {
    throw new OrderApiError(422, "That transaction isn't this escrow's payout.");
  }

  if (row) {
    const { data: updated, error } = await admin
      .from("escrows")
      .update({ payout_tx_hash: txHash, paid_out_at: new Date().toISOString() })
      .eq("id", row.id)
      .is("paid_out_at", null)
      .select("id");
    if (error) throw dbError("save payout", error);
    if (updated?.length) {
      const href = `/dashboard/escrow/${id}`;
      await notify(admin, outcome === "refund" ? row.buyer_id : row.seller_id, {
        type: "payment",
        severity: "success",
        title: outcome === "refund" ? `Refund paid: ${row.asset_name}` : `You've been paid: ${row.asset_name}`,
        description: outcome === "refund" ? "Your XLM is back in your wallet." : "The disputed payment was paid out to your wallet.",
        href,
      });
    }
  }
  await admin.from("payment_events").insert({
    user_id: userId,
    step: "funds_claimed",
    network: STELLAR.network,
    contract_id: STELLAR.escrowContractId,
    chain_escrow_id: id.toString(),
    tx_hash: txHash,
    client_at: new Date().toISOString(),
  });
  return { outcome, txHash };
}

async function isAdminUser(admin: Admin, userId: string): Promise<boolean> {
  const { data } = await admin.from("profiles").select("role").eq("id", userId).maybeSingle();
  return data?.role === "ADMIN";
}
