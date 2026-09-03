import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getPublishedEventBySlug } from "@/lib/data/customer/events";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import RegisterView from "./register-view";
import styles from "./register.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Register | LnR Cycle Center",
  description: "Register for an LnR Cycle Center cycling event.",
};

export default async function EventRegisterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/events/${slug}/register`)}`);
  }

  const result = await getPublishedEventBySlug(slug);
  const event = result.data;
  if (!event) notFound();

  return (
    <>
      <CustomerHeader />
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <h1 className={styles.title}>{event.title}</h1>
            <p className={styles.subtitle}>
              Enter your rider details to reserve a slot.
            </p>
            <RegisterView event={event} />
          </div>
        </div>
      </main>
      <CustomerFooter />
    </>
  );
}
