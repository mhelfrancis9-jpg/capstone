import type { Metadata } from "next";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CustomBikeBuilder from "@/components/customer/CustomBikeBuilder/CustomBikeBuilder";
import { getBikeBuilderSteps } from "@/lib/data/customer/bike-builder";

export const metadata: Metadata = {
  title: "Custom Bike Builder | LNR Cycle Center",
  description:
    "Build your own custom bike — pick every part or let our AI builder choose them for you. Hand-assembled in Tabaco City and shipped ride-ready.",
};

/**
 * Route: /custom-bike-builder
 * Reached from the homepage "Build Your Own Custom Bike" promo (Start Now).
 * Reuses the existing customer header and footer — only this page's content
 * is new. Builder steps + products are fetched server-side and passed to the
 * interactive client component.
 */
export default async function CustomBikeBuilderPage() {
  const stepsResult = await getBikeBuilderSteps();

  return (
    <div>
      <CustomerHeader />

      <main>
        <CustomBikeBuilder
          steps={stepsResult.data ?? []}
          stepsError={stepsResult.error}
        />
      </main>

      <CustomerFooter />
    </div>
  );
}

