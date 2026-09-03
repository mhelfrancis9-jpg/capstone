import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { sanitizeNext } from "@/lib/navigation";
import { getCustomerProfile } from "@/lib/data/customer/profile";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import LocationForm from "./location-form";
import styles from "@/app/customer-auth.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Delivery location | LnR Cycle Center",
  description:
    "Set or update your saved delivery location for faster checkout at LnR Cycle Center.",
};

type LocationPageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LocationPage({ searchParams }: LocationPageProps) {
  const user = await getUser();
  const { next } = await searchParams;
  const nextPath = sanitizeNext(typeof next === "string" ? next : "", "/profile");

  // Checkout / profile point here; a signed-out visitor must sign in first.
  if (!user) {
    const loginNext = encodeURIComponent(
      `/location?next=${encodeURIComponent(nextPath)}`
    );
    redirect(`/login?next=${loginNext}`);
  }

  const profile = await getCustomerProfile(user.id);

  return (
    <>
      <CustomerHeader />
      <main className={styles.page}>
        <section className={styles.card} aria-labelledby="location-title">
          <Link href="/profile" className={styles.backLink}>
            ← Back to profile
          </Link>
          <h1 className={styles.heading} id="location-title">
            Your Delivery Location
          </h1>
          <p className={styles.subheading}>
            {profile?.location
              ? "Update where we deliver your orders."
              : "Set where we deliver your orders — you only need to do this once."}
          </p>
          <LocationForm
            initial={
              profile?.location
                ? {
                    latitude: profile.location.latitude,
                    longitude: profile.location.longitude,
                    address: profile.location.address,
                    label: profile.location.label,
                  }
                : null
            }
            next={nextPath}
          />
        </section>
      </main>
      <CustomerFooter />
    </>
  );
}
