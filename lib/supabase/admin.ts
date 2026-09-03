import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

/**
 * Privileged server-side Supabase client (service-role key).
 *
 * Security model
 * -----------------------------------------------------------------------------
 *  - Importable ONLY from Server Components, Server Actions and Route
 *    Handlers. The `server-only` package turns any accidental client-side
 *    import into a build error, so the service-role key can never leak into
 *    the browser bundle.
 *  - Bypasses Row Level Security. The anon key (and the storefront RLS
 *    policies) stay strictly read-only in the browser.
 *  - Used for every admin CRUD operation and for storage object cleanup.
 *
 * Returns `null` when SUPABASE_SERVICE_ROLE_KEY is missing so callers can
 * surface a friendly setup message instead of crashing.
 */
let adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient | null {
  if (adminClient) {
    return adminClient;
  }

  const config = getSupabaseConfig();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !config ||
    !serviceRoleKey ||
    serviceRoleKey.trim().length === 0
  ) {
    return null;
  }

  adminClient = createClient(config.url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  return adminClient;
}
