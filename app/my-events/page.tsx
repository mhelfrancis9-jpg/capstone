import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getOrCreateCustomer } from "@/lib/data/customer/customers";
import { listMyEventRegistrations } from "@/lib/data/customer/events";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import styles from "./my-events.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Events | LnR Cycle Center",
  description: "Your LnR Cycle Center event registrations and tickets.",
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Pending Verification",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  rejected: "Rejected",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

export default async function MyEventsPage() {
  const user = await getUser();
  if (!user) redirect("/login?next=%2Fmy-events");

  const customer = await getOrCreateCustomer(user);
  if (!customer) {
    redirect("/login?next=%2Fmy-events");
  }

  const result = await listMyEventRegistrations(customer.id);
  const registrations = result.data ?? [];

  return (
    <>
      <CustomerHeader />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>My Events</h1>

          {result.error ? (
            <p className={styles.error} role="alert">
              {result.error}
            </p>
          ) : null}

          {registrations.length === 0 ? (
            <p className={styles.empty}>
              You haven&apos;t registered for any events yet.{" "}
              <Link href="/events">Browse events</Link>.
            </p>
          ) : (
            <ul className={styles.list}>
              {registrations.map((reg) => (
                <li key={reg.id} className={styles.row}>
                  <div className={styles.info}>
                    <span className={styles.eventName}>
                      {reg.event?.title ?? "Event"}
                    </span>
                    <span className={styles.meta}>
                      {reg.registration_code} ·{" "}
                      {reg.event ? formatDate(reg.event.event_date) : ""}
                    </span>
                    <span className={styles.rider}>Rider: {reg.rider_name}</span>
                  </div>
                  <span
                    className={`${styles.status} ${
                      styles[`pay_${reg.payment_status}`] ?? ""
                    }`}
                  >
                    {PAYMENT_LABELS[reg.payment_status] ?? reg.payment_status}
                  </span>
                  <div className={styles.actions}>
                    <Link
                      href={`/my-events/${encodeURIComponent(reg.registration_code)}`}
                      className={styles.view}
                    >
                      View ticket
                    </Link>
                    {reg.payment_status !== "paid" ? (
                      <Link
                        href={`/event-payment/${encodeURIComponent(reg.registration_code)}`}
                        className={styles.pay}
                      >
                        {reg.payment_status === "rejected" ? "Resubmit" : "Pay"}
                      </Link>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
      <CustomerFooter />
    </>
  );
}
