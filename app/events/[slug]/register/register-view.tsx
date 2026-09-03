"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerForEventAction } from "./action";
import type { EventRow } from "@/lib/data/types";
import styles from "./register.module.css";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);
}

const CATEGORIES = ["Fun Ride", "Race", "Charity Ride", "Workshop", "Meetup"];

type Props = {
  event: EventRow;
};

export default function RegisterView({ event }: Props) {
  const [state, formAction, pending] = useActionState(
    registerForEventAction,
    { error: null }
  );

  return (
    <form action={formAction} className={styles.form} noValidate>
      <input type="hidden" name="slug" value={event.slug} />

      <h2 className={styles.heading}>Registration details</h2>
      <p className={styles.fee}>
        Registration fee:{" "}
        <strong>{event.price > 0 ? formatCurrency(event.price) : "Free"}</strong>
      </p>

      <label className={styles.field}>
        <span className={styles.label}>Rider name *</span>
        <input
          name="rider_name"
          className={styles.input}
          placeholder="Full name of the rider"
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Plate number</span>
        <input
          name="plate_number"
          className={styles.input}
          placeholder="Optional — e.g. ABC-1234"
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Category</span>
        <select name="category" className={styles.input} defaultValue={event.category}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}

      <div className={styles.actions}>
        <Link href={`/events/${event.slug}`} className={styles.cancel}>
          Cancel
        </Link>
        <button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "Reserving…" : "Continue to payment"}
        </button>
      </div>
    </form>
  );
}
