import type { Metadata } from "next";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ClearCartOnMount from "@/components/customer/ClearCartOnMount";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order placed | LnR Cycle Center",
  description: "Your LnR Cycle Center order has been placed.",
};

type SuccessPageProps = {
  searchParams: Promise<{ order?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { order } = await searchParams;
  const orderNumber =
    typeof order === "string" && order.trim() ? order.trim() : null;

  return (
    <>
      <CustomerHeader />
      <main className={styles.page}>
        <ClearCartOnMount />
        <div className={styles.container}>
          <div className={styles.icon} aria-hidden="true">
            ✓
          </div>
          <h1 className={styles.title}>Order placed!</h1>
          <p className={styles.text}>
            Thank you for shopping with LnR Cycle Center.
          </p>
          {orderNumber ? (
            <p className={styles.orderNumber}>
              Order number: <strong>{orderNumber}</strong>
            </p>
          ) : null}
          <p className={styles.text}>
            We&apos;ve saved your order. You can track its status anytime from{" "}
            <Link href="/profile" className={styles.link}>
              your account
            </Link>
            . Since you chose Cash on Delivery, have the payment ready when your
            order arrives.
          </p>
          <Link href="/products" className={styles.button}>
            Continue Shopping
          </Link>
        </div>
      </main>
      <CustomerFooter />
    </>
  );
}
