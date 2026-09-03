"use client";

import { useActionState, useState } from "react";
import { saveCustomerLocation } from "./actions";
import LocationPicker from "@/components/customer/LocationPicker";
import styles from "@/app/customer-auth.module.css";

type LocationFormProps = {
  initial: {
    latitude: number;
    longitude: number;
    address: string;
    label: string | null;
  } | null;
  /** Sanitized in-app path to continue to after saving. */
  next: string;
};

export default function LocationForm({ initial, next }: LocationFormProps) {
  const [state, formAction, isSaving] = useActionState(saveCustomerLocation, {
    error: null,
  });
  const [locationPending, setLocationPending] = useState(false);

  return (
    <form action={formAction} noValidate className={styles.form}>
      <input type="hidden" name="next" value={next} />
      <LocationPicker initial={initial} onPendingChange={setLocationPending} />

      {state.error ? (
        <p role="alert" className={styles.error}>
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        className={styles.button}
        disabled={isSaving || locationPending}
      >
        {isSaving
          ? "Saving…"
          : locationPending
            ? "Confirming location…"
            : "Save Delivery Location"}
      </button>
    </form>
  );
}
