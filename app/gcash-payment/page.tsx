import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GCash Payment | LnR Cycle Center",
  description: "GCash payment for your LnR Cycle Center order.",
};

/**
 * Bare `/gcash-payment` has no order context. Real payment pages live under
 * `/gcash-payment/[orderNumber]` (see the `[orderNumber]` folder); redirect
 * anyone landing here to their account so they can pick an order.
 */
export default function GcashPaymentIndexPage() {
  redirect("/profile");
}
