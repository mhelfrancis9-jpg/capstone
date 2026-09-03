import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { type QueryResult } from "@/lib/data/types";
import { missingServiceRoleMessage, toFriendlyDbError } from "@/lib/data/admin/errors";
import type { CustomerLocation, CheckoutLineInput } from "./types";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Flat delivery fee applied to every checkout (₱190). */
export const CHECKOUT_SHIPPING_FEE = 190;

export type CreateCustomerOrderInput = {
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  location: CustomerLocation;
  items: CheckoutLineInput[];
  paymentMethod: "gcash" | "cod";
};

export type CreateCustomerOrderResult = {
  orderNumber: string;
  total: number;
  paymentMethod: "gcash" | "cod";
};

/**
 * Places a customer order (service-role write).
 *
 * The price/stock/variant data is always resolved server-side from the
 * database; anything coming from the client cart is treated as untrusted.
 * On success the order, its items, the status-history entry and stock
 * decrements are committed.
 */
export async function createCustomerOrder(
  input: CreateCustomerOrderInput
): Promise<QueryResult<CreateCustomerOrderResult>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  if (input.items.length === 0) {
    return {
      data: null,
      error: "Your cart is empty. Add a product before checking out.",
    };
  }
  if (!input.location.address.trim()) {
    return {
      data: null,
      error: "A saved delivery location is required before checking out.",
    };
  }

  // Resolve and validate every line against the database.
  const lines: Array<{
    productId: string;
    variantId: string | null;
    productName: string;
    size: string | null;
    color: string | null;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    productStock: number;
    variantStock: number | null;
  }> = [];
  let subtotal = 0;

  for (const item of input.items) {
    const quantity =
      Number.isInteger(item.quantity) && item.quantity > 0 ? item.quantity : null;
    if (quantity === null) {
      return { data: null, error: "One of the cart quantities is invalid. Please update your cart." };
    }

    const productId = String(item.productId ?? "").trim();
    const slug = String(item.slug ?? "").trim();
    if (!productId && !slug) {
      return { data: null, error: "A cart item is missing its product reference. Please update your cart." };
    }

    let product = productId
      ? await admin
          .from("products")
          .select("id, name, price, stock, slug")
          .eq("id", productId)
          .maybeSingle()
      : null;
    if (!product?.data && slug) {
      product = await admin
        .from("products")
        .select("id, name, price, stock, slug")
        .eq("slug", slug)
        .maybeSingle();
    }

    if (!product?.data) {
      return { data: null, error: `"${item.name}" is no longer available. Please remove it from your cart.` };
    }
    const productRow = product.data as { id: string; name: string; price: number; stock: number; slug: string };

    if (Number(productRow.stock) < quantity) {
      return {
        data: null,
        error: `Not enough stock for "${productRow.name}". Please lower the quantity in your cart.`,
      };
    }

    // Optional variant check (size/color combos).
    let variantId: string | null = null;
    let variantStock: number | null = null;
    const size = String(item.size ?? "").trim() || null;
    const color = String(item.color ?? "").trim() || null;
    if (size || color) {
      let variantQuery = admin
        .from("product_variants")
        .select("id, stock")
        .eq("product_id", productRow.id);
      if (size) variantQuery = variantQuery.eq("size", size);
      if (color) variantQuery = variantQuery.eq("color", color);

      const { data: variant } = await variantQuery.maybeSingle();
      if (variant) {
        variantId = variant.id;
        variantStock = Number(variant.stock);
        if (variantStock < quantity) {
          return {
            data: null,
            error: `Not enough stock for "${productRow.name}" (${size ?? "any size"} / ${color ?? "any color"}). Please lower the quantity in your cart.`,
          };
        }
      }
    }

    const unitPrice = Number(productRow.price);
    const lineTotal = unitPrice * quantity;
    subtotal += lineTotal;

    lines.push({
      productId: productRow.id,
      variantId,
      productName: productRow.name,
      size,
      color,
      unitPrice,
      quantity,
      lineTotal,
      productStock: Number(productRow.stock),
      variantStock,
    });
  }

  const shippingFee = CHECKOUT_SHIPPING_FEE;
  const total = subtotal + shippingFee;

  // Order number — sequential per year, retried a few times on collisions.
  let order: { id: string; order_number: string } | null = null;
  let orderError: unknown = null;
  for (let attempt = 0; attempt < 3 && !order; attempt++) {
    const orderNumber = await nextOrderNumber(admin, attempt);
    const result = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: input.customerId,
        customer_name: input.customerName.trim(),
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        shipping_address: input.location.address.trim(),
        shipping_latitude: input.location.latitude,
        shipping_longitude: input.location.longitude,
        subtotal,
        shipping_fee: shippingFee,
        discount: 0,
        total,
        payment_method: input.paymentMethod,
        payment_status: "pending",
        status: "pending",
        payment_reference: null,
        notes: null,
      })
      .select("id, order_number")
      .single();

    if (result.error) {
      // 23505 = unique violation on order_number — try the next number.
      if (result.error.code === "23505") {
        orderError = result.error;
        continue;
      }
      return { data: null, error: toFriendlyDbError(result.error) };
    }
    order = result.data as { id: string; order_number: string };
    orderError = null;
  }

  if (!order) {
    return { data: null, error: toFriendlyDbError(orderError) };
  }

  const itemsResult = await admin
    .from("order_items")
    .insert(
      lines.map((line) => ({
        order_id: order.id,
        product_id: line.productId,
        product_variant_id: line.variantId,
        product_name: line.productName,
        size: line.size,
        color: line.color,
        unit_price: line.unitPrice,
        quantity: line.quantity,
        line_total: line.lineTotal,
      }))
    );
  if (itemsResult.error) {
    return { data: null, error: toFriendlyDbError(itemsResult.error) };
  }

  const historyResult = await admin
    .from("order_status_history")
    .insert({
      order_id: order.id,
      status: "pending",
      note: "Order placed",
      created_by: null,
    });
  if (historyResult.error) {
    return { data: null, error: toFriendlyDbError(historyResult.error) };
  }

  // Decrement stock (product + variant), clamped at zero.
  for (const line of lines) {
    await admin
      .from("products")
      .update({ stock: Math.max(0, line.productStock - line.quantity) })
      .eq("id", line.productId);

    if (line.variantId !== null && line.variantStock !== null) {
      await admin
        .from("product_variants")
        .update({ stock: Math.max(0, line.variantStock - line.quantity) })
        .eq("id", line.variantId);
    }
  }

  return {
    data: { orderNumber: order.order_number, total, paymentMethod: input.paymentMethod },
    error: null,
  };
}

async function nextOrderNumber(
  admin: SupabaseClient,
  attempt: number
): Promise<string> {
  const year = new Date().getFullYear();
  const { count } = await admin
    .from("orders")
    .select("id", { count: "exact", head: true })
    .gte("created_at", `${year}-01-01T00:00:00.000Z`);

  const sequence = (count ?? 0) + attempt + 1;
  return `ORD-${year}-${String(sequence).padStart(4, "0")}`;
}
