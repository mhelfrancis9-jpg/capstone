import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { getGcashSettings } from "@/lib/data/admin/gcash";
import { getEventRegistrationByCode } from "@/lib/data/customer/events";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import EventPaymentView from "./event-payment-view";
import styles from "./payment.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event Payment | LnR Cycle Center",
  description: "GCash payment for your LnR Cycle Center event registration.",
};

export default async function EventPaymentPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const registrationCode = decodeURIComponent(code);

  const regResult = await getEventRegistrationByCode(registrationCode);
  const registration = regResult.data;

  if (!registration) notFound();
  if (registration.status === "cancelled") notFound();

  // Already verified? Show the ticket instead of re-collecting payment.
  if (registration.payment_status === "paid") {
    redirect(`/my-events?code=${encodeURIComponent(registrationCode)}`);
  }

  const settingsResult = await getGcashSettings();

  return (
    <>
      <CustomerHeader />
      <main className={styles.page}>
        <div className={styles.container}>
          <EventPaymentView
            registrationCode={registration.registration_code}
            eventTitle={registration.event?.title ?? "Event registration"}
            amount={Number(registration.amount_paid) || 0}
            settings={settingsResult.data ?? null}
          />
        </div>
      </main>
      <CustomerFooter />
    </>
  );
}
