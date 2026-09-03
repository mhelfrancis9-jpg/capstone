import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

/**
 * Server-side Supabase client bound to the request cookie store.
 * Works in Server Components, Server Actions and Route Handlers.
 * Returns `null` when the environment variables are not configured.
 */
export async function createClient() {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component, which cannot set cookies.
          // When this runs in a Server Action the cookie is applied.
        }
      },
    },
  });
}

/**
 * Returns the authenticated Supabase user for the current request,
 * memoized per server render pass. `null` when signed out or when
 * Supabase is not configured.
 */
export const getUser = cache(async (): Promise<User | null> => {
  const supabase = await createClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
});