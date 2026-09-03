import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  type CustomerLocation,
  type CustomerLocationInput,
} from "./types";
import { type QueryResult } from "@/lib/data/types";
import { missingServiceRoleMessage, toFriendlyDbError } from "@/lib/data/admin/errors";

/**
 * Returns the customer's saved (default) location, or `null`.
 * Read path uses the RLS-bound anon client.
 */
export async function getCustomerDefaultLocation(
  customerId: string
): Promise<CustomerLocation | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("customer_locations")
    .select("*")
    .eq("customer_id", customerId)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1);

  if (!data || data.length === 0) return null;
  return data[0] as CustomerLocation;
}

/**
 * Creates or replaces the customer's single saved location (service-role
 * write). The storefront deliberately keeps a one-location model for now:
 * an existing default location is updated in place.
 */
export async function upsertCustomerLocation(
  customerId: string,
  input: CustomerLocationInput
): Promise<QueryResult<CustomerLocation | null>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const payload = {
    label: input.label?.trim() || null,
    address: input.address.trim(),
    latitude: input.latitude,
    longitude: input.longitude,
  };

  const { data: existing } = await admin
    .from("customer_locations")
    .select("id")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (existing && existing.length > 0) {
    const { data, error } = await admin
      .from("customer_locations")
      .update(payload)
      .eq("id", existing[0].id)
      .select()
      .single();
    if (error) return { data: null, error: toFriendlyDbError(error) };
    return { data: (data as CustomerLocation) ?? null, error: null };
  }

  const { data, error } = await admin
    .from("customer_locations")
    .insert({ customer_id: customerId, is_default: true, ...payload })
    .select()
    .single();
  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: (data as CustomerLocation) ?? null, error: null };
}
