/**
 * Small navigation helpers shared by the customer auth pages.
 */

/**
 * Returns a safe in-app path from a `next` query parameter. Only allows
 * same-origin paths starting with a single "/" so a crafted value cannot
 * become an open redirect (e.g. "//evil.com" or "https://evil.com").
 */
export function sanitizeNext(
  value: string | null | undefined,
  fallback = "/checkout"
): string {
  const candidate = (value ?? "").trim();
  if (!candidate.startsWith("/") || candidate.startsWith("//")) {
    return fallback;
  }
  return candidate;
}
