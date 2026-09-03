"use client";

import { useEffect } from "react";
import { useCart } from "./CartContext";

/**
 * Clears the localStorage cart once, right after a successful order. Mounted
 * on the checkout success page so the "placed order" items are not submitted
 * again on a future checkout.
 */
export default function ClearCartOnMount() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // Only run once when the success page appears.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
