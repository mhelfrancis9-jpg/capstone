"use client";

import { useActionState } from "react";
import { customerForgotPassword, type ForgotState } from "../login/actions";
import styles from "@/app/customer-auth.module.css";

const INITIAL: ForgotState = { status: "idle", message: null };

export default function ForgotPasswordForm() {
  const [state, formAction, isSending] = useActionState(
    customerForgotPassword,
    INITIAL
  );

  if (state.status === "sent") {
    return (
      <div className={styles.confirmPanel}>
        <div className={styles.confirmIcon}>✓</div>
        <h2 className={styles.confirmTitle}>Check your inbox</h2>
        <p className={styles.confirmText}>{state.message}</p>
        <a className={styles.button} href="/login" style={{ textDecoration: "none" }}>
          Back to Sign In
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} noValidate className={styles.form}>
      <div className={styles.field}>
        <label htmlFor="email" className={styles.label}>
          Email Address:
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          className={styles.input}
          autoFocus
        />
      </div>

      {state.status === "error" && state.message ? (
        <p role="alert" className={styles.error}>
          {state.message}
        </p>
      ) : null}

      <button type="submit" className={styles.button} disabled={isSending}>
        {isSending ? "Sending…" : "Send Reset Link"}
      </button>
    </form>
  );
}
