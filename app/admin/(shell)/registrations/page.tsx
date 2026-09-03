import type { Metadata } from "next";
import { listAllRegistrations } from "@/lib/data/admin/events";
import RegistrationsManager from "@/components/admin/events/RegistrationsManager";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Sign-ups | LnR Cycle Center",
};

export const dynamic = "force-dynamic";

export default async function AdminRegistrationsPage() {
  const result = await listAllRegistrations();

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>Event Sign-ups</h1>

      <RegistrationsManager
        initialRegistrations={result.data ?? []}
        error={result.error ?? undefined}
      />
    </section>
  );
}
