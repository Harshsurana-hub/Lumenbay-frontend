import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL } from './env';

/**
 * Supabase client with the service-role key. Bypasses row level security.
 *
 * Server only: route handlers that have already checked who is asking and
 * verified the facts against the chain. Orders and escrows have no client
 * write policies on purpose, so this is the only way they get written.
 *
 * The key has no `NEXT_PUBLIC_` prefix, so Next never inlines it into a
 * browser bundle; the window check is a second line of defence against this
 * module being imported from client code by mistake.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('createAdminClient must never run in the browser.');
  }
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY.\n' +
        '  Local:  add it to .env.local\n' +
        '  Vercel: Project Settings > Environment Variables (mark it Sensitive)\n' +
        '  Supabase dashboard: Project Settings > API Keys > secret / service_role.',
    );
  }
  return createClient(SUPABASE_URL, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
