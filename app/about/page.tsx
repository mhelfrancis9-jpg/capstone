import type { Metadata } from "next";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import About from "@/components/customer/About/About";

export const metadata: Metadata = {
  title: "About Us | LNR Cycle Center",
  description:
    "Learn about LnR Cycle Center — building, fixing and racing bikes in Tabaco City, Albay since 2011. Custom builds, service and repair, and race support.",
};

/**
 * Route: /about
 * Reached from the customer header/footer "About Us" link. Reuses the existing
 * customer header and footer — only this page's content is new.
 */
export default function AboutPage() {
  return (
    <div>
      <CustomerHeader />

      <main>
        <About />
      </main>

      <CustomerFooter />
    </div>
  );
}
