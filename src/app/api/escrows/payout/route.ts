import { recordPayout } from "@/lib/admin/server";
import { orderRoute } from "@/lib/orders/route";
import { parseChainId } from "@/lib/orders/server";

/** Records the payout of a resolved dispute (`claim_disputed_funds`), after checking it on-chain. */
export const POST = orderRoute((userId, body) => recordPayout(userId, parseChainId(body.chainEscrowId), body.txHash));
