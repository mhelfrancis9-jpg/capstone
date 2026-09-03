"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/lib/data/admin/categories";
import type { CategoryInput } from "@/lib/data/types";

async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function saveCategoryAction(
  input: CategoryInput
): Promise<{ error: string | null }> {
  await requireAdmin();

  if (!input.name.trim()) {
    return { error: "Category name is required." };
  }

  const result = input.id
    ? await updateCategory(input.id, input)
    : await createCategory(input);

  if (result.error || !result.data) {
    return { error: result.error ?? "Failed to save the category." };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");

  return { error: null };
}

export async function deleteCategoryAction(
  id: string
): Promise<{ error: string | null }> {
  await requireAdmin();

  const result = await deleteCategory(id);
  if (result.error) return { error: result.error };

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/products");

  return { error: null };
}
