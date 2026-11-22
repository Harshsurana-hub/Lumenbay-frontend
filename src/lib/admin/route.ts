import { NextResponse } from "next/server";
import { OrderApiError } from "@/lib/orders/server";
import { requireAdmin, type AdminSession } from "./server";

/**
 * Wraps an admin route: checks the caller is an admin (server side, from
 * profiles.role), parses a JSON body for POSTs, and turns failures into
 * `{ error }` responses with the right status.
 */
export function adminRoute(handler: (session: AdminSession, body: Record<string, unknown>, request: Request) => Promise<unknown>) {
  return async (request: Request) => {
    try {
      const session = await requireAdmin();
      const body = request.method === "GET" ? {} : ((await request.json().catch(() => ({}))) as Record<string, unknown>);
      return NextResponse.json(await handler(session, body, request), { headers: { "Cache-Control": "no-store" } });
    } catch (e) {
      if (e instanceof OrderApiError) return NextResponse.json({ error: e.message }, { status: e.status });
      console.error("[lumenbay:admin] unexpected", e);
      return NextResponse.json({ error: "Something went wrong on our side. Nothing on-chain was changed by this request." }, { status: 500 });
    }
  };
}
