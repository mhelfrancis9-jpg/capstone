import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  type ProductInput,
  type ProductRow,
  type QueryResult,
} from "@/lib/data/types";
import { missingServiceRoleMessage, toFriendlyDbError } from "./errors";

const PRODUCT_SELECT = `
  id, category_id, name, slug, sku, description, tagline, specs,
  price, compare_at_price, cost, stock, status, is_featured, is_new_arrival,
  sort_order, created_at, updated_at,
  category:categories(id, name, slug),
  product_images(id, url, alt, sort_order, is_primary),
  product_variants(id, sku, name, size, color, price, stock, available, sort_order)
`;

/** "Met Bluegrass Intox" -> "met-bluegrass-intox" (mirrors the SQL slugify()). */
function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

/** Extracts the storage object path from a public `images` bucket URL. */
export function storagePathFromPublicUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/images/";
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return url.slice(index + marker.length).split("?")[0];
}

/**
 * Ensures the product slug is unique across the catalog, appending a short
 * random suffix on collision (the DB unique constraint stays the final guard).
 */
async function ensureUniqueSlug(
  admin: SupabaseClient,
  desired: string,
  excludeId: string | null
): Promise<string> {
  const base = slugify(desired) || "product";
  let slug = base;

  const { data: existing } = await admin
    .from("products")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing && existing.id !== excludeId) {
    slug = `${base}-${crypto.randomUUID().slice(0, 8)}`;
  }

  return slug;
}

/** Replaces the image and variant rows of a product (delete + re-insert). */
async function replaceMedia(
  admin: SupabaseClient,
  productId: string,
  input: ProductInput
): Promise<string | null> {
  const imageRows = input.images
    .map((image, index) => ({
      product_id: productId,
      url: image.url.trim(),
      alt: image.alt?.trim() || null,
      sort_order: (index + 1) * 10,
      is_primary: index === 0,
    }))
    .filter((row) => row.url.length > 0);

  const { error: imageError } = await admin
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (imageError) return toFriendlyDbError(imageError);

  if (imageRows.length > 0) {
    const { error } = await admin.from("product_images").insert(imageRows);
    if (error) return toFriendlyDbError(error);
  }

  const variantRows = input.variants
    .map((variant, index) => ({
      product_id: productId,
      sku: variant.sku?.trim() || null,
      name:
        variant.size || variant.color
          ? [variant.size, variant.color].filter(Boolean).join(" / ")
          : null,
      size: variant.size?.trim() || null,
      color: variant.color?.trim() || null,
      price: Number(variant.price) || 0,
      stock: Math.max(0, Math.floor(Number(variant.stock) || 0)),
      available: variant.available,
      sort_order: (index + 1) * 10,
    }))
    .filter((variant) => variant.size || variant.color || variant.sku);

  const { error: variantError } = await admin
    .from("product_variants")
    .delete()
    .eq("product_id", productId);
  if (variantError) return toFriendlyDbError(variantError);

  if (variantRows.length > 0) {
    const { error } = await admin.from("product_variants").insert(variantRows);
    if (error) return toFriendlyDbError(error);
  }

  return null;
}

/** Best-effort removal of storage objects that are no longer referenced. */
async function cleanupRemovedImages(
  admin: SupabaseClient,
  productId: string,
  keepUrls: string[]
): Promise<void> {
  try {
    const { data } = await admin
      .from("product_images")
      .select("url")
      .eq("product_id", productId);
    if (!data) return;

    const keep = new Set(keepUrls.map((url) => url.trim()));
    const paths = data
      .map((row) => ({ path: storagePathFromPublicUrl(row.url), url: row.url.trim() }))
      .filter((entry) => entry.path !== null && !keep.has(entry.url))
      .map((entry) => entry.path as string);

    if (paths.length > 0) {
      await admin.storage.from("images").remove(paths);
    }
  } catch {
    // Never block the product save because of cleanup trouble.
  }
}

export async function getProductById(
  id: string
): Promise<QueryResult<ProductRow>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const { data, error } = await admin
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) return { data: null, error: toFriendlyDbError(error) };
  // The untyped client infers the embedded `category` relation as an array,
  // but PostgREST returns a single object (to-one FK). Cast via `unknown`.
  return { data: (data as unknown as ProductRow) ?? null, error: null };
}

export async function listProducts(): Promise<QueryResult<ProductRow[]>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const { data, error } = await admin
    .from("products")
    .select(PRODUCT_SELECT)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: (data as unknown as ProductRow[]) ?? [], error: null };
}

export async function createProduct(
  input: ProductInput
): Promise<QueryResult<ProductRow>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const slug = await ensureUniqueSlug(admin, input.slug || input.name, null);

  const { data: created, error } = await admin
    .from("products")
    .insert({
      category_id: input.category_id,
      name: input.name.trim(),
      slug,
      sku: input.sku?.trim() || null,
      description: input.description?.trim() || null,
      tagline: input.tagline,
      specs: input.specs,
      price: Number(input.price) || 0,
      compare_at_price: input.compare_at_price,
      cost: input.cost,
      stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
      status: input.status,
      is_featured: input.is_featured,
      is_new_arrival: input.is_new_arrival,
      sort_order: Math.floor(input.sort_order) || 0,
    })
    .select("id")
    .single();

  if (error) return { data: null, error: toFriendlyDbError(error) };

  const mediaError = await replaceMedia(admin, created.id, input);
  if (mediaError) return { data: null, error: mediaError };

  return getProductById(created.id);
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<QueryResult<ProductRow>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  await cleanupRemovedImages(
    admin,
    id,
    input.images.map((image) => image.url)
  );

  const slug = await ensureUniqueSlug(admin, input.slug || input.name, id);

  const { error } = await admin
    .from("products")
    .update({
      category_id: input.category_id,
      name: input.name.trim(),
      slug,
      sku: input.sku?.trim() || null,
      description: input.description?.trim() || null,
      tagline: input.tagline,
      specs: input.specs,
      price: Number(input.price) || 0,
      compare_at_price: input.compare_at_price,
      cost: input.cost,
      stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
      status: input.status,
      is_featured: input.is_featured,
      is_new_arrival: input.is_new_arrival,
      sort_order: Math.floor(input.sort_order) || 0,
    })
    .eq("id", id);

  if (error) return { data: null, error: toFriendlyDbError(error) };

  const mediaError = await replaceMedia(admin, id, input);
  if (mediaError) return { data: null, error: mediaError };

  return getProductById(id);
}

export async function deleteProduct(
  id: string
): Promise<QueryResult<null>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  // Remove the product's storage objects first (best-effort), then the row
  // (images/variants cascade).
  try {
    const { data } = await admin
      .from("product_images")
      .select("url")
      .eq("product_id", id);
    if (data) {
      const paths = data
        .map((row) => storagePathFromPublicUrl(row.url))
        .filter((path): path is string => path !== null);
      if (paths.length > 0) {
        await admin.storage.from("images").remove(paths);
      }
    }
  } catch {
    // Best-effort cleanup only.
  }

  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { data: null, error: toFriendlyDbError(error) };

  return { data: null, error: null };
}

