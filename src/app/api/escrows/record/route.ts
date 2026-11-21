import { orderRoute, str } from "@/lib/orders/route";
import { parseChainId, recordOrder } from "@/lib/orders/server";

/** Records a funded on-chain escrow as an order, after checking it against the chain. Safe to retry. */
export const POST = orderRoute((userId, body) =>
  recordOrder(userId, parseChainId(body.chainEscrowId), {
    createTxHash: str(body.createTxHash),
    fundTxHash: str(body.fundTxHash),
  }),
);
