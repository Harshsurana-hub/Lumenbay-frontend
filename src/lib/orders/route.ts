import { NextResponse } from "next/server";
import { OrderApiError, requireUserId } from "./server";

/**
 * Wraps an order route: parses the JSON body, resolves the signed-in user,
 * and turns failures into `{ error }` responses with the right status.
 * Unexpected errors are logged in full and answered with a generic message.
 */
export function orderRoute(handler: (userId: string, body: Record<string, unknown>) => Promise<unknown>) {
  return async (request: Request) => {
    try {
      const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
      const userId = await requireUserId();
      return NextResponse.json(await handler(userId, body));
    } catch (e) {
      if (e instanceof OrderApiError) return NextResponse.json({ error: e.message }, { status: e.status });
      console.error("[lumenbay:orders] unexpected", e);
      return NextResponse.json({ error: "Something went wrong on our side. Your money is safe on-chain; try again." }, { status: 500 });
    }
  };
}

export const str = (v: unknown) => (typeof v === "string" ? v : undefined);
