import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getAdminSession } from "@/lib/admin/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/**
 * Gate for every admin page. Runs on the server and reads profiles.role with
 * the service role, so a role in the browser's session metadata counts for
 * nothing. The API routes check again on every request.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/auth/login?returnUrl=%2Fdashboard%2Fadmin%2Fdisputes");

  const session = await getAdminSession();
  if (!session) {
    return (
      <div className="min-h-screen bg-bg">
        <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 pb-16 pt-32 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-bad-bg text-bad">
            <ShieldAlert className="h-6 w-6" aria-hidden />
          </span>
          <h1 className="font-display text-2xl font-bold text-ink">Admins only</h1>
          <p className="text-sm text-ink-muted">This area is for Lumenbay staff who resolve disputes. Your account doesn&apos;t have admin access.</p>
          <Link href="/dashboard/buying" className="mt-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-on-accent hover:bg-accent-hover">
            Back to your dashboard
          </Link>
        </main>
      </div>
    );
  }
  return <>{children}</>;
}
