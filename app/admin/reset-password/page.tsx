import type { Metadata } from "next";
import ResetPasswordForm from "./reset-password-form";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset password | LnR Cycle Center",
  description: "Set a new password for your LnR Cycle Center admin account.",
};

export default function AdminResetPasswordPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <section className={styles.card} aria-labelledby="reset-title">
          <h1 className={styles.title} id="reset-title">
            Set a new password
          </h1>
          <p className={styles.subtitle}>
            Enter a new password for your administrator account.
          </p>
          <ResetPasswordForm />
        </section>
      </div>
    </main>
  );
}