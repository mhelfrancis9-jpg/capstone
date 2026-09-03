import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { sanitizeNext } from "@/lib/navigation";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import SignUpForm from "./signup-form";
import styles from "@/app/customer-auth.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create account | LnR Cycle Center",
  description:
    "Create your LnR Cycle Center account — one account for faster checkout, order tracking and saved delivery locations.",
};

type SignUpPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const user = await getUser();
  const { next } = await searchParams;

  if (user) {
    redirect("/profile");
  }

  const nextPath = sanitizeNext(typeof next === "string" ? next : "", "/profile");
  const loginHref = `/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <>
      <CustomerHeader />
      <main className={styles.page}>
        <section className={styles.card} aria-labelledby="signup-title">
          <h1 className={styles.heading} id="signup-title">
            Create Your Account
          </h1>
          <p className={styles.subheading}>
            One account for faster checkout, order tracking and a saved
            delivery location.
          </p>
          <SignUpForm next={nextPath} />
          <p className={styles.switch}>
            Already have an account?{" "}
            <Link href={loginHref} className={styles.switchLink}>
              Log in
            </Link>
          </p>
        </section>
      </main>
      <CustomerFooter />
    </>
  );
}
