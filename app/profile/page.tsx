import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { getCustomerProfile } from "@/lib/data/customer/profile";
import type { OrderRow } from "@/lib/data/types";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ProfileForms from "./profile-forms";
import SignOutButton from "./sign-out-button";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Account | LnR Cycle Center",
  description:
    "Manage your LnR Cycle Center account, delivery location and order history.",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipping: "In Transit",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_CLASSES: Record<string, string> = {
  pending: styles.pending,
  confirmed: styles.confirmed,
  shipping: styles.shipping,
  completed: styles.completed,
  cancelled: styles.cancelled,
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Pending Verification",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
  rejected: "Rejected",
};

const PAYMENT_CLASSES: Record<string, string> = {
  pending: styles.payPending,
  paid: styles.payPaid,
  failed: styles.payFailed,
  refunded: styles.payRefunded,
  rejected: styles.payRejected,
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) {
    redirect("/login?next=%2Fprofile");
  }

  const profile = await getCustomerProfile(user.id);

  if (!profile) {
    return (
      <>
        <CustomerHeader />
        <main className={styles.page}>
          <div className={styles.container}>
            <p className={styles.empty}>
              We couldn&apos;t load your account. Please try again later.
            </p>
          </div>
        </main>
        <CustomerFooter />
      </>
    );
  }

  const { customer, location, orders } = profile;

  return (
    <>
      <CustomerHeader />
      <main className={styles.page}>
        <div className={styles.container}>
          <div className={styles.headRow}>
            <div>
              <h1 className={styles.title}>Hi, {customer.full_name}</h1>
              <p className={styles.subtitle}>{customer.email}</p>
            </div>
            <SignOutButton />
          </div>

          <div className={styles.grid}>
            <section className={styles.card} aria-labelledby="info-title">
              <h2 className={styles.cardTitle} id="info-title">
                Personal Information
              </h2>
              <ProfileForms
                initial={{
                  fullName: customer.full_name,
                  email: customer.email,
                  phone: customer.phone,
                }}
              />
            </section>

            <section className={styles.card} aria-labelledby="location-title">
              <h2 className={styles.cardTitle} id="location-title">
                Delivery Location
              </h2>
              {location ? (
                <div className={styles.location}>
                  {location.label ? (
                    <p className={styles.locationLabel}>{location.label}</p>
                  ) : null}
                  <p className={styles.locationAddress}>{location.address}</p>
                  <p className={styles.locationCoords}>
                    {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
                  </p>
                  <Link href="/location?next=%2Fprofile" className={styles.editLocation}>
                    Update delivery location
                  </Link>
                </div>
              ) : (
                <div className={styles.location}>
                  <p className={styles.locationEmpty}>
                    You haven&apos;t set a delivery location yet — checkout requires
                    one before you can place an order.
                  </p>
                  <Link href="/location?next=%2Fprofile" className={styles.editLocation}>
                    Set delivery location
                  </Link>
                </div>
              )}
            </section>
          </div>

          <section className={styles.card} aria-labelledby="orders-title">
            <h2 className={styles.cardTitle} id="orders-title">
              Order History
            </h2>
            {orders.length === 0 ? (
              <p className={styles.empty}>
                No orders yet. <Link href="/products">Start shopping</Link>.
              </p>
            ) : (
              <ul className={styles.orderList}>
                {orders.map((order: OrderRow) => (
                  <li key={order.id} className={styles.orderRow}>
                    <div className={styles.orderMeta}>
                      <span className={styles.orderNumber}>{order.order_number}</span>
                      <span className={styles.orderDate}>{formatDate(order.created_at)}</span>
                    </div>
                    <div className={styles.orderItems}>
                      {order.order_items?.map((item) => (
                        <span key={item.id} className={styles.orderItem}>
                          {item.product_name} × {item.quantity}
                        </span>
                      ))}
                    </div>
                    <div className={styles.orderTotal}>
                      <div className={styles.orderPay}>
                        {order.payment_method === "gcash" ? (
                          <>
                            <span className={styles.payMethod}>GCash</span>
                            <span
                              className={`${styles.payStatus} ${
                                PAYMENT_CLASSES[order.payment_status] ?? ""
                              }`}
                            >
                              {PAYMENT_LABELS[order.payment_status] ??
                                order.payment_status}
                            </span>
                            <Link
                              href={`/gcash-payment/${order.order_number}`}
                              className={styles.payLink}
                            >
                              View payment
                            </Link>
                          </>
                        ) : (
                          <span className={styles.payMethod}>
                            Cash on Delivery
                          </span>
                        )}
                      </div>
                      <span
                        className={`${styles.status} ${
                          STATUS_CLASSES[order.status] ?? ""
                        }`}
                      >
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                      <span className={styles.total}>
                        {formatCurrency(order.total)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <CustomerFooter />
    </>
  );
}
