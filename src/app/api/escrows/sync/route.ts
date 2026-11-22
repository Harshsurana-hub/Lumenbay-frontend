import { orderRoute, str } from "@/lib/orders/route";
import { parseChainId, syncOrder } from "@/lib/orders/server";

/**
 * Re-reads an escrow from the chain and updates the order to match (released,
 * disputed, refunded). Right after opening a dispute the buyer also sends
 * their note; it is kept only if it matches the fingerprint stored on-chain.
 */
export const POST = orderRoute((userId, body) =>
  syncOrder(userId, parseChainId(body.chainEscrowId), { releaseTxHash: str(body.releaseTxHash) }, str(body.disputeNote)),
);
