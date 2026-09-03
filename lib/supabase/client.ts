"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/**
 * Returns a lazily-created Supabase browser client used inside Client
 * Components. Environment is resolved at call time so the app still
 * renders (and builds) before the .env keys are provided.
 */
export function getBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables."
    );
  }

  browserClient = createBrowserClient(config.url, config.anonKey);
  return browserClient;
}