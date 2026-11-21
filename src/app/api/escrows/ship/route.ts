import { orderRoute, str } from "@/lib/orders/route";
import { markShipped, parseChainId } from "@/lib/orders/server";

/** Seller marks a funded order as shipped, with an optional note (courier, tracking number). */
export const POST = orderRoute((userId, body) =>
  markShipped(userId, parseChainId(body.chainEscrowId), str(body.note) ?? ""),
);
