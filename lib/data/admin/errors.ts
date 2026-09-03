import "server-only";

const SETUP_MESSAGE =
  "The database tables are not ready yet. Open the Supabase dashboard (SQL Editor) " +
  "and run the migration files in /supabase/migrations in order (0001 → 0005), " +
  "then refresh this page.";

const SERVICE_ROLE_MESSAGE =
  "The admin backend is not configured: add SUPABASE_SERVICE_ROLE_KEY to your " +
  "environment variables (.env), then restart the dev server.";

/**
 * Converts a Supabase client error into a friendly, human-readable message.
 * Handles the two most common setup failures (schema not applied / missing
 * service-role key) plus generic permission and connectivity errors.
 */
export function toFriendlyDbError(error: unknown): string {
  if (!error) return "Something went wrong. Please try again.";

  const err = error as {
    code?: string;
    message?: string;
    details?: string;
    hint?: string;
  };

  const message = `${err.message ?? ""} ${err.details ?? ""} ${err.hint ?? ""}`.trim();
  const code = err.code ?? "";

  // 42P01 = undefined_table — migrations have not been applied.
  if (
    code === "42P01" ||
    /relation .* does not exist|could not find the table|does not exist/i.test(message)
  ) {
    return SETUP_MESSAGE;
  }

  if (
    code === "42501" ||
    /permission denied for (table|schema)/i.test(message)
  ) {
    return "Permission denied. Contact the project administrator.";
  }

  // 23503 = foreign key violation (e.g. deleting a category that has products).
  if (code === "23503" || /foreign key constraint/i.test(message)) {
    return "This record is still referenced by other data and cannot be deleted. Remove the related records first.";
  }

  // 23505 = unique violation (duplicate slug / SKU / email).
  if (code === "23505" || /duplicate key value violates unique constraint/i.test(message)) {
    return "A record with the same identifier already exists (duplicate slug, SKU or email). Please use a different value.";
  }

  if (message) return message;
  return "Something went wrong. Please try again.";
}

/** Message shown when the service-role key is missing. */
export function missingServiceRoleMessage(): string {
  return SERVICE_ROLE_MESSAGE;
}
