import type { Metadata } from "next";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ForgotPasswordForm from "./forgot-password-form";
import styles from "@/app/customer-auth.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Forgot password | LnR Cycle Center",
  description: "Request a password reset link for your LnR Cycle Center account.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <CustomerHeader />
      <main className={styles.page}>
        <section className={styles.card} aria-labelledby="forgot-title">
          <Link href="/login" className={styles.backLink}>
            ← Back to sign in
          </Link>
          <h1 className={styles.heading} id="forgot-title">
            Forgot Password
          </h1>
          <p className={styles.subheading}>
            Enter your account email and we&apos;ll send you a link to set a new
            password.
          </p>
          <ForgotPasswordForm />
        </section>
      </main>
      <CustomerFooter />
    </>
  );
}
