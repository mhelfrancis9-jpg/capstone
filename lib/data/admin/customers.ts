import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { type CustomerRow, type QueryResult } from "@/lib/data/types";
import { missingServiceRoleMessage, toFriendlyDbError } from "./errors";

export async function listCustomers(): Promise<QueryResult<CustomerRow[]>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const { data, error } = await admin
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: (data as CustomerRow[]) ?? [], error: null };
}

export async function deleteCustomer(
  id: string
): Promise<QueryResult<null>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  // orders.customer_id is `on delete set null`, so past orders keep their
  // customer snapshot and only lose the directory link.
  const { error } = await admin.from("customers").delete().eq("id", id);
  if (error) return { data: null, error: toFriendlyDbError(error) };

  return { data: null, error: null };
}
