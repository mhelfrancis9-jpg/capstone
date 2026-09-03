"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getBrowserClient } from "@/lib/supabase/client";
import { useCart } from "@/components/customer/CartContext";
import { saveCustomerCart } from "@/app/cart/actions";
import styles from "./page.module.css";

/**
 * Sign Out control.
 *
 * Flushes the latest cart to the customer's saved cart (while the session is
 * still valid), then signs out client-side and returns home. The saved DB cart
 * is never deleted — CartContext clears only the client-side copy on the
 * SIGNED_OUT auth event, so the cart comes back on the next sign-in.
 */
export default function SignOutButton() {
  const router = useRouter();
  const { items } = useCart();
  const [pending, setPending] = useState(false);

  const handleSignOut = async () => {
    if (pending) return;
    setPending(true);

    try {
      // Persist the cart one last time so recent changes survive the logout.
      await saveCustomerCart(items);
    } catch {
      // Sign out regardless — the debounced sync already saved recent changes.
    }

    try {
      await getBrowserClient().auth.signOut();
    } catch {
      // Ignore — CartContext's SIGNED_OUT handler also clears the client cart.
    }

    router.push("/");
    router.refresh();
  };

  return (
    <button
      type="button"
      className={styles.signOut}
      onClick={handleSignOut}
      disabled={pending}
    >
      {pending ? "Signing Out…" : "Sign Out"}
    </button>
  );
}
