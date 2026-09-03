import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event Payment | LnR Cycle Center",
  description: "GCash payment for your LnR Cycle Center event registration.",
};

/** Bare `/event-payment` has no registration context — send the customer to
 *  their events so they can pick a registration to pay for. */
export default function EventPaymentIndexPage() {
  redirect("/my-events");
}
