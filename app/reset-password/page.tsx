import type { Metadata } from "next";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ResetPasswordForm from "./reset-password-form";
import styles from "@/app/customer-auth.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reset password | LnR Cycle Center",
  description: "Set a new password for your LnR Cycle Center customer account.",
};

export default function CustomerResetPasswordPage() {
  return (
    <>
      <CustomerHeader />
      <main className={styles.page}>
        <section className={styles.card} aria-labelledby="reset-title">
          <Link href="/login" className={styles.backLink}>
            ← Back to sign in
          </Link>
          <h1 className={styles.heading} id="reset-title">
            Set a new password
          </h1>
          <p className={styles.subheading}>
            Enter a new password for your account.
          </p>
          <ResetPasswordForm />
        </section>
      </main>
      <CustomerFooter />
    </>
  );
}
