/**
 * Central Supabase configuration.
 *
 * Environment variables are read at runtime (never hardcoded):
 * - NEXT_PUBLIC_SUPABASE_URL        – Supabase project URL
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY  – Supabase anon/public API key
 */

export type SupabaseConfig = {
  url: string;
  anonKey: string;
};

const isConfigured = (value: string | undefined): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function getSupabaseConfig(): SupabaseConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isConfigured(url) || !isConfigured(anonKey)) {
    return null;
  }

  return { url: url as string, anonKey: anonKey as string };
}