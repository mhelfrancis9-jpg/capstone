"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateCustomer } from "@/lib/data/customer/customers";
import {
  normalizePhMobileNumber,
  submitGcashPayment,
} from "@/lib/data/customer/gcash";

export type SubmitGcashState = {
  error: string | null;
};

/**
 * Server Action: records the customer's GCash payment submission.
 *
 * The screenshot is uploaded straight to the public `images` storage bucket
 * from the browser (same pattern as the admin Products manager) and only the
 * resulting URL is posted here — large files never pass through the Next.js
 * server. The URL is re-validated to the configured Supabase project so a
 * random external link can never be stored as a payment proof.
 */
export async function submitGcashPaymentAction(
  prevState: SubmitGcashState | undefined,
  formData: FormData
): Promise<SubmitGcashState> {
  const supabase = await createClient();
  if (!supabase) {
    return { error: "Supabase is not configured. Please refresh and try again." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "You must be signed in to submit a payment." };
  }

  const customer = await getOrCreateCustomer(user);
  if (!customer) {
    return { error: "We couldn't load your customer account. Please try again." };
  }

  const orderId = String(formData.get("order_id") ?? "").trim();
  const orderNumber = String(formData.get("order_number") ?? "").trim();
  const senderName = String(formData.get("sender_name") ?? "").trim();
  const phoneNumber = String(formData.get("phone_number") ?? "").trim();
  const referenceNumber = String(formData.get("reference_number") ?? "").trim();
  const screenshotUrl = String(formData.get("screenshot_url") ?? "").trim();

  if (!orderId || !orderNumber) {
    return { error: "The order could not be identified. Please go back and try again." };
  }
  if (!senderName) {
    return { error: "Please enter your full name." };
  }
  const normalizedPhone = normalizePhMobileNumber(phoneNumber);
  if (!normalizedPhone) {
    return {
      error: "Please enter a valid Philippine mobile number (e.g. 0917 123 4567).",
    };
  }
  if (!screenshotUrl) {
    return { error: "Please upload a screenshot of your GCash payment." };
  }

  const storageUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/+$/, "");
  if (
    !storageUrl ||
    !screenshotUrl.startsWith(`${storageUrl}/storage/v1/object/public/images/`)
  ) {
    return { error: "The uploaded screenshot is not valid. Please upload it again." };
  }

  const result = await submitGcashPayment({
    orderId,
    customerId: customer.id,
    senderName,
    phoneNumber: normalizedPhone,
    referenceNumber: referenceNumber || null,
    screenshotUrl,
  });

  if (result.error) {
    return { error: result.error };
  }

  redirect(`/gcash-payment/${encodeURIComponent(orderNumber)}`);
}
