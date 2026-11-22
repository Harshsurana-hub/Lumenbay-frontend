import { adminRoute } from "@/lib/admin/route";
import { recordResolution } from "@/lib/admin/server";
import { parseChainId } from "@/lib/orders/server";

/**
 * Records a dispute the admin has already settled on-chain with
 * `resolve_dispute`. Verifies the transaction and the chain status, moves
 * the order, stores the internal note and tells both parties.
 */
export const POST = adminRoute((session, body) =>
  recordResolution(session, parseChainId(body.chainEscrowId), { outcome: body.outcome, note: body.note, txHash: body.txHash }),
);
