"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { deleteCustomer } from "@/lib/data/admin/customers";

async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function deleteCustomerAction(
  id: string
): Promise<{ error: string | null }> {
  await requireAdmin();

  const result = await deleteCustomer(id);
  if (result.error) return { error: result.error };

  revalidatePath("/admin/customers");
  revalidatePath("/admin/dashboard");

  return { error: null };
}
