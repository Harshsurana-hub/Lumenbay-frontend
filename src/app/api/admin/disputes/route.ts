import { adminRoute } from "@/lib/admin/route";
import { getDispute, listDisputeQueue } from "@/lib/admin/server";
import { parseDisputeQuery } from "@/lib/admin/disputeQuery";
import { parseChainId } from "@/lib/orders/server";

export const dynamic = "force-dynamic";

/**
 * `?id=` returns one dispute in full. Otherwise one page of the queue:
 * `tab`, `q`, `reason`, `min`, `max`, `sort`, `page` (see disputeQuery.ts),
 * and `sync=1` to rescan the contract instead of using the recent scan.
 */
export const GET = adminRoute((_session, _body, request) => {
  const params = new URL(request.url).searchParams;
  const id = params.get("id");
  if (id) return getDispute(parseChainId(id));
  return listDisputeQueue(parseDisputeQuery(params), { sync: params.get("sync") === "1" });
});
