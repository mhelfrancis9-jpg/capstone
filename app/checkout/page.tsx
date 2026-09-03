import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getOrCreateCustomer } from "@/lib/data/customer/customers";
import { getCustomerDefaultLocation } from "@/lib/data/customer/locations";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CheckoutView from "./checkout-view";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | LnR Cycle Center",
  description: "Review your cart and place your LnR Cycle Center order.",
};

/**
 * Checkout is locked behind the customer account + saved delivery location
 * gates:
 *   - signed out       → /login?next=/checkout
 *   - no saved location → /location?next=/checkout
 * The cart itself lives in localStorage (CartContext), so it survives the
 * auth redirect round-trip.
 */
export default async function CheckoutPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login?next=%2Fcheckout");
  }

  const customer = await getOrCreateCustomer(user);
  if (!customer) {
    return (
      <>
        <CustomerHeader />
        <main className={styles.page}>
          <div className={styles.container}>
            <h1 className={styles.title}>Checkout</h1>
            <p className={styles.text}>
              We couldn&apos;t load your customer account. Please try again later.
            </p>
          </div>
        </main>
        <CustomerFooter />
      </>
    );
  }

  const location = await getCustomerDefaultLocation(customer.id);
  if (!location) {
    redirect("/location?next=%2Fcheckout");
  }

  return (
    <>
      <CustomerHeader />
      <main className={styles.page}>
        <div className={styles.container}>
          <h1 className={styles.title}>Checkout</h1>
          <CheckoutView
            customerName={customer.full_name}
            location={{
              label: location.label,
              address: location.address,
            }}
          />
        </div>
      </main>
      <CustomerFooter />
    </>
  );
}

