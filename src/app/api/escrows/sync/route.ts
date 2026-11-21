import { orderRoute, str } from "@/lib/orders/route";
import { parseChainId, syncOrder } from "@/lib/orders/server";

/** Re-reads an escrow from the chain and updates the order to match (released, disputed, refunded). */
export const POST = orderRoute((userId, body) =>
  syncOrder(userId, parseChainId(body.chainEscrowId), { releaseTxHash: str(body.releaseTxHash) }),
);
