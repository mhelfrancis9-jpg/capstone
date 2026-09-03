import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import {
  type CategoryInput,
  type CategoryRow,
  type QueryResult,
} from "@/lib/data/types";
import { missingServiceRoleMessage, toFriendlyDbError } from "./errors";

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function listCategories(): Promise<QueryResult<CategoryRow[]>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const { data, error } = await admin
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: (data as CategoryRow[]) ?? [], error: null };
}

export async function createCategory(
  input: CategoryInput
): Promise<QueryResult<CategoryRow>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const slug = slugify(input.slug || input.name) || "category";

  const { data, error } = await admin
    .from("categories")
    .insert({
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      sort_order: Math.floor(input.sort_order) || 0,
      is_active: input.is_active,
    })
    .select("*")
    .single();

  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: (data as CategoryRow) ?? null, error: null };
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<QueryResult<CategoryRow>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const slug = slugify(input.slug || input.name) || "category";

  const { data, error } = await admin
    .from("categories")
    .update({
      name: input.name.trim(),
      slug,
      description: input.description?.trim() || null,
      sort_order: Math.floor(input.sort_order) || 0,
      is_active: input.is_active,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: (data as CategoryRow) ?? null, error: null };
}

export async function deleteCategory(
  id: string
): Promise<QueryResult<null>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const { error } = await admin.from("categories").delete().eq("id", id);
  if (error) return { data: null, error: toFriendlyDbError(error) };

  return { data: null, error: null };
}
