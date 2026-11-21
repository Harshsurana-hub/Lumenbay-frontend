import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for Google/GitHub sign-in. Supabase redirects here with a
 * one-time `code`, which is exchanged for a session cookie before sending the
 * user on to where they were heading.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "";

  // Same-origin paths only; anything else would be an open redirect.
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/home";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(destination, origin));
  }

  const login = new URL("/auth/login", origin);
  login.searchParams.set("error", "oauth");
  return NextResponse.redirect(login);
}
