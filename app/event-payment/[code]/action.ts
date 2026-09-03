"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { submitEventGcashPayment } from "@/lib/data/customer/events";

export type SubmitEventPaymentState = {
  error: string | null;
  success: boolean;
};

/**
 * Server Action: records the customer's GCash payment proof for an event
 * registration.
 *
 * The screenshot is uploaded straight to the public `images` storage bucket
 * from the browser (same pattern as the order GCash flow and the admin
 * Products manager) and only the resulting URL is posted here, so large files
 * never pass through the Next.js server. The URL is re-validated to the
 * configured Supabase project so a random external link can never be stored as
 * a payment proof.
 */
export async function submitEventGcashPaymentAction(
  _prevState: SubmitEventPaymentState | undefined,
  formData: FormData
): Promise<SubmitEventPaymentState> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase is not configured. Please refresh and try again.", success: false };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to submit a payment.", success: false };
  }

  const registrationCode = String(formData.get("registration_code") ?? "").trim();
  const senderName = String(formData.get("sender_name") ?? "").trim();
  const phoneNumber = String(formData.get("phone_number") ?? "").trim();
  const referenceNumber = String(formData.get("reference_number") ?? "").trim();
  const screenshotUrl = String(formData.get("screenshot_url") ?? "").trim();

  if (!registrationCode) {
    return { error: "Missing registration reference.", success: false };
  }
  if (!senderName) {
    return { error: "Please enter the sender name.", success: false };
  }
  if (!phoneNumber) {
    return { error: "Please enter your GCash phone number.", success: false };
  }
  if (!screenshotUrl) {
    return { error: "Please upload your GCash payment screenshot.", success: false };
  }

  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (
    !storageUrl ||
    !screenshotUrl.startsWith(`${storageUrl}/storage/v1/object/public/images/`)
  ) {
    return { error: "The uploaded screenshot is not valid. Please upload it again.", success: false };
  }

  const result = await submitEventGcashPayment({
    registrationCode,
    senderName,
    phoneNumber,
    referenceNumber: referenceNumber || null,
    screenshotUrl,
  });

  if (result.error) return { error: result.error, success: false };

  revalidatePath(`/event-payment/${registrationCode}`);
  revalidatePath("/my-events");
  return { error: null, success: true };
}