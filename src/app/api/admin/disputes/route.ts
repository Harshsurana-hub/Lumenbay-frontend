import { adminRoute } from "@/lib/admin/route";
import { getDispute, listDisputes } from "@/lib/admin/server";
import { parseChainId } from "@/lib/orders/server";

export const dynamic = "force-dynamic";

/** Open disputes (database plus a scan of the contract), or one dispute with `?id=`. */
export const GET = adminRoute((_session, _body, request) => {
  const id = new URL(request.url).searchParams.get("id");
  return id ? getDispute(parseChainId(id)) : listDisputes();
});
