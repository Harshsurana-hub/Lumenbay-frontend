import type { SupabaseClient } from "@supabase/supabase-js";
import { STELLAR } from "@/lib/stellar/config";
import type { DbEscrowState, DbOrderStatus } from "./escrowState";

/**
 * Order reads for the dashboards. Uses the signed-in user's client, so row
 * level security limits results to orders they are a party to.
 */

export interface OrderSummary {
  orderId: string;
  createdAt: string;
  status: DbOrderStatus;
  totalXlm: number;
  role: "buyer" | "seller";
  productId: string;
  productName: string;
  image: string | null;
  /** Display name of the other party. */
  counterparty: string;
  chainEscrowId: string | null;
  state: DbEscrowState | null;
  shippedAt: string | null;
  shippingNote: string | null;
  fundTxHash: string | null;
  releaseTxHash: string | null;
}

const ORDER_COLUMNS = `
  id, created_at, status, total_xlm_price, buyer_id, seller_id, product_id,
  buyer:profiles!orders_buyer_id_fkey ( display_name ),
  seller:profiles!orders_seller_id_fkey ( display_name ),
  products ( name, product_images ( url, position ) ),
  escrows ( asset_name, chain_escrow_id, current_state, shipped_at, shipping_note, fund_tx_hash, release_tx_hash )
`;

type One<T> = T | T[] | null;
const one = <T,>(v: One<T>): T | null => (Array.isArray(v) ? v[0] ?? null : v);

interface OrderRow {
  id: string;
  created_at: string;
  status: DbOrderStatus;
  total_xlm_price: string | number;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  buyer: One<{ display_name: string | null }>;
  seller: One<{ display_name: string | null }>;
  products: One<{ name: string; product_images: { url: string; position: number }[] | null }>;
  escrows: One<{
    asset_name: string;
    chain_escrow_id: number | string | null;
    current_state: DbEscrowState;
    shipped_at: string | null;
    shipping_note: string | null;
    fund_tx_hash: string | null;
    release_tx_hash: string | null;
  }>;
}

function mapOrder(row: OrderRow, me: string): OrderSummary {
  const role = row.buyer_id === me ? "buyer" : "seller";
  const product = one(row.products);
  const escrow = one(row.escrows);
  const other = one(role === "buyer" ? row.seller : row.buyer);
  const images = [...(product?.product_images ?? [])].sort((a, b) => a.position - b.position);
  return {
    orderId: row.id,
    createdAt: row.created_at,
    status: row.status,
    totalXlm: Number(row.total_xlm_price),
    role,
    productId: row.product_id,
    productName: product?.name ?? escrow?.asset_name ?? "Listing",
    image: images[0]?.url ?? null,
    counterparty: other?.display_name ?? (role === "buyer" ? "Seller" : "Buyer"),
    chainEscrowId: escrow?.chain_escrow_id != null ? String(escrow.chain_escrow_id) : null,
    state: escrow?.current_state ?? null,
    shippedAt: escrow?.shipped_at ?? null,
    shippingNote: escrow?.shipping_note ?? null,
    fundTxHash: escrow?.fund_tx_hash ?? null,
    releaseTxHash: escrow?.release_tx_hash ?? null,
  };
}

/** Orders where the user is the buyer (`buying`) or the seller (`selling`), newest first. */
export async function listOrders(supabase: SupabaseClient, me: string, side: "buying" | "selling"): Promise<OrderSummary[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_COLUMNS)
    .eq(side === "buying" ? "buyer_id" : "seller_id", me)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw new Error(error.message);
  return (data as unknown as OrderRow[]).map((r) => mapOrder(r, me));
}

/** The order recorded for one on-chain escrow, if the user is a party to it. */
export async function getOrderByChainId(supabase: SupabaseClient, me: string, chainEscrowId: string): Promise<OrderSummary | null> {
  const { data: escrow, error } = await supabase
    .from("escrows")
    .select("order_id")
    .eq("contract_id", STELLAR.escrowContractId)
    .eq("chain_escrow_id", chainEscrowId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!escrow) return null;
  const { data, error: orderError } = await supabase.from("orders").select(ORDER_COLUMNS).eq("id", escrow.order_id).maybeSingle();
  if (orderError) throw new Error(orderError.message);
  return data ? mapOrder(data as unknown as OrderRow, me) : null;
}

/** What each state means for each side, in plain words, and whether it needs them. */
export function orderStage(o: Pick<OrderSummary, "state" | "role">): { label: string; tone: "accent" | "ok" | "warn" | "bad" | "muted"; needsYou: boolean } {
  const s = o.state;
  if (o.role === "seller") {
    if (s === "funded" || s === "in_escrow") return { label: "Ready to ship", tone: "warn", needsYou: true };
    if (s === "in_transit") return { label: "Shipped · awaiting buyer", tone: "accent", needsYou: false };
    if (s === "released") return { label: "Paid out", tone: "ok", needsYou: false };
    if (s === "disputed") return { label: "In dispute", tone: "bad", needsYou: true };
    if (s === "refunded") return { label: "Refunded to buyer", tone: "muted", needsYou: false };
  } else {
    if (s === "funded" || s === "in_escrow") return { label: "Paid · awaiting shipment", tone: "accent", needsYou: false };
    if (s === "in_transit") return { label: "On its way · confirm on arrival", tone: "warn", needsYou: true };
    if (s === "released") return { label: "Completed", tone: "ok", needsYou: false };
    if (s === "disputed") return { label: "In dispute", tone: "bad", needsYou: false };
    if (s === "refunded") return { label: "Refunded", tone: "ok", needsYou: false };
  }
  return { label: "Processing", tone: "muted", needsYou: false };
}
