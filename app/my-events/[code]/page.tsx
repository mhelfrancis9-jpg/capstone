import type { Metadata } from "next";
import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getOrCreateCustomer } from "@/lib/data/customer/customers";
import { getEventRegistrationByCode } from "@/lib/data/customer/events";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import styles from "./ticket.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event Ticket | LnR Cycle Center",
  description: "Your event registration ticket.",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function EventTicketPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const registrationCode = decodeURIComponent(code);

  const user = await getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/my-events/${registrationCode}`)}`);

  const customer = await getOrCreateCustomer(user);
  if (!customer) redirect("/login");

  const result = await getEventRegistrationByCode(registrationCode);
  const reg = result.data;

  if (!reg) notFound();
  if (reg.customer_id !== customer.id) notFound();

  const event = reg.event;
  const paid = reg.payment_status === "paid";

  return (
    <>
      <CustomerHeader />
      <main className={styles.page}>
        <div className={styles.container}>
          <Link href="/my-events" className={styles.back}>
            ← Back to my events
          </Link>

          <div className={styles.ticket}>
            <div className={styles.stub}>
              <span className={styles.stubLabel}>ENTRY PASS</span>
              <span className={styles.stubCode}>{reg.registration_code}</span>
            </div>

            <div className={styles.main}>
              <div className={styles.eventHeader}>
                <h1 className={styles.eventTitle}>{event?.title ?? "Event"}</h1>
                <span className={`${styles.badge} ${paid ? styles.paid : styles.unpaid}`}>
                  {paid ? "Confirmed" : "Pending Payment"}
                </span>
              </div>

              <dl className={styles.facts}>
                <div>
                  <dt>Rider</dt>
                  <dd>{reg.rider_name}</dd>
                </div>
                <div>
                  <dt>Date</dt>
                  <dd>{event ? formatDate(event.event_date) : "TBD"}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{event?.location ?? "TBD"}</dd>
                </div>
                <div>
                  <dt>Category</dt>
                  <dd>{reg.category || "Fun Ride"}</dd>
                </div>
                {reg.plate_number ? (
                  <div>
                    <dt>Plate</dt>
                    <dd>{reg.plate_number}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>Amount</dt>
                  <dd>{formatCurrency(Number(reg.amount_paid) || 0)}</dd>
                </div>
              </dl>

              {!paid ? (
                <div className={styles.cta}>
                  <p className={styles.ctaText}>
                    Complete your GCash payment to confirm this registration.
                  </p>
                  <Link
                    href={`/event-payment/${encodeURIComponent(reg.registration_code)}`}
                    className={styles.payButton}
                  >
                    Pay now
                  </Link>
                </div>
              ) : (
                <p className={styles.confirmed}>
                  ✓ Your slot is confirmed. Present this code at the event
                  registration booth.
                </p>
              )}

              {reg.proof_screenshot_url ? (
                <div className={styles.proof}>
                  <span className={styles.proofLabel}>Payment proof</span>
                  <img
                    src={reg.proof_screenshot_url}
                    alt="GCash payment screenshot"
                    className={styles.proofImg}
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
      <CustomerFooter />
    </>
  );
}
