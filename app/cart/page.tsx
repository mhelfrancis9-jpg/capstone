import type { Metadata } from "next";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import CartView from "@/components/customer/CartView";

export const metadata: Metadata = {
  title: "Shopping Cart | LNR Cycle Center",
  description: "Review the items in your LNR Cycle Center shopping cart.",
};

export default function CartPage() {
  return (
    <>
      <CustomerHeader />
      <CartView />
      <CustomerFooter />
    </>
  );
}
