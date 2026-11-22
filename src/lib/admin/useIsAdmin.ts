"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { createClient } from "@/lib/supabase/client";

const cache = new Map<string, boolean>();

/**
 * Whether to show admin links. Reads profiles.role (publicly readable), not
 * the session metadata, which users can set themselves. Only decides what to
 * show: the admin pages and routes check the role again on the server.
 */
export function useIsAdmin(): boolean {
  const { user } = useAuth();
  const [checked, setChecked] = useState<{ userId: string; isAdmin: boolean } | null>(null);

  useEffect(() => {
    if (!user || cache.has(user.id)) return;
    let cancelled = false;
    createClient()
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const isAdmin = data?.role === "ADMIN";
        cache.set(user.id, isAdmin);
        if (!cancelled) setChecked({ userId: user.id, isAdmin });
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) return false;
  if (checked?.userId === user.id) return checked.isAdmin;
  return cache.get(user.id) ?? false;
}
