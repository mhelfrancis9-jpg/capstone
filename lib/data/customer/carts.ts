import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { CartItem } from "@/components/customer/cart-store";
import {
  missingServiceRoleMessage,
  toFriendlyDbError,
} from "@/lib/data/admin/errors";

/**
 * Returns the saved cart items for the given customer, or `null` when none
 * has been saved yet. Read path uses the RLS-bound client so the caller can
 * only ever see their own cart row.
 */
export async function getCustomerCart(
  customerId: string
): Promise<CartItem[] | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("customer_carts")
    .select("items")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (!data) return null;
  const items = data.items as unknown;
  return Array.isArray(items) ? (items as CartItem[]) : null;
}

/**
 * Upserts the customer's saved cart (service-role write). Called whenever the
 * signed-in customer's cart changes and right before sign-out to flush the
 * latest state.
 *
 * The saved cart is intentionally NEVER deleted here — logout only clears the
 * client-side copy. Saving an empty array simply stores an empty cart.
 */
export async function saveCustomerCart(
  customerId: string,
  items: CartItem[]
): Promise<{ error: string | null }> {
  const admin = getAdminClient();
  if (!admin) return { error: missingServiceRoleMessage() };

  const { error } = await admin
    .from("customer_carts")
    .upsert(
      {
        customer_id: customerId,
        items,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "customer_id" }
    );

  if (error) return { error: toFriendlyDbError(error) };
  return { error: null };
}
