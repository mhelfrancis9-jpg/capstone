"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import {
  reviewRegistrationPayment,
  updateRegistrationStatus,
} from "@/lib/data/admin/events";
import type { RegistrationStatus } from "@/lib/data/types";

async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/admin/login");
  return user;
}

export type RegistrationReviewDecision = "paid" | "rejected";

export async function reviewRegistrationAction(
  registrationId: string,
  decision: RegistrationReviewDecision,
  reason?: string | null
): Promise<{ error: string | null }> {
  const user = await requireAdmin();

  if (decision !== "paid" && decision !== "rejected") {
    return { error: "Invalid review decision." };
  }

  const result = await reviewRegistrationPayment({
    registrationId,
    decision,
    reviewerId: user.id,
    reason: decision === "rejected" ? reason : null,
  });
  if (result.error) return { error: result.error };

  revalidatePath("/admin/registrations");
  revalidatePath("/admin/dashboard");
  revalidatePath("/my-events");

  return { error: null };
}

const VALID_STATUS: RegistrationStatus[] = ["registered", "cancelled"];

export async function updateRegistrationStatusAction(
  registrationId: string,
  status: RegistrationStatus
): Promise<{ error: string | null }> {
  await requireAdmin();

  if (!VALID_STATUS.includes(status)) {
    return { error: "Invalid registration status." };
  }

  const result = await updateRegistrationStatus(registrationId, status);
  if (result.error) return { error: result.error };

  revalidatePath("/admin/registrations");
  revalidatePath("/my-events");

  return { error: null };
}
