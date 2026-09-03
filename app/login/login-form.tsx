"use client";

import { useActionState, useState } from "react";
import {
  customerLogin,
  customerForgotPassword,
  type ForgotState,
} from "./actions";
import styles from "@/app/customer-auth.module.css";

const INITIAL_LOGIN: { error: string | null } = { error: null };
const INITIAL_FORGOT: ForgotState = { status: "idle", message: null };

type LoginFormProps = {
  /** Sanitized in-app path to continue to after signing in. */
  next: string;
};

export default function LoginForm({ next }: LoginFormProps) {
  const [loginState, loginAction, isSubmitting] = useActionState(
    customerLogin,
    INITIAL_LOGIN
  );
  const [forgotState, forgotAction, isForgotSending] = useActionState(
    customerForgotPassword,
    INITIAL_FORGOT
  );
  const [showForgot, setShowForgot] = useState(false);

  return (
    <>
      <form action={loginAction} noValidate className={styles.form}>
        <input type="hidden" name="next" value={next} />

        <div className={styles.field}>
          <label htmlFor="email" className={styles.label}>
            Email Address:
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="Email Address"
            required
            className={styles.input}
            autoFocus
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="password" className={styles.label}>
            Password:
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            required
            minLength={8}
            className={styles.input}
          />
        </div>

        {loginState.error ? (
          <p role="alert" className={styles.error}>
            {loginState.error}
          </p>
        ) : null}

        <button type="submit" className={styles.button} disabled={isSubmitting}>
          {isSubmitting ? "Signing in…" : "Sign In"}
        </button>
      </form>

      <div className={styles.forgotArea}>
        {showForgot ? (
          <form action={forgotAction} className={styles.forgotForm}>
            <label htmlFor="forgot-email" className={styles.forgotLabel}>
              Reset password for your account email:
            </label>
            <div className={styles.forgotRow}>
              <input
                id="forgot-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={styles.input}
              />
              <button
                type="submit"
                className={styles.forgotButton}
                disabled={isForgotSending}
              >
                {isForgotSending ? "Sending…" : "Send link"}
              </button>
            </div>
            {forgotState.message ? (
              <p
                role={forgotState.status === "error" ? "alert" : "status"}
                className={
                  forgotState.status === "error"
                    ? styles.error
                    : styles.forgotSuccess
                }
              >
                {forgotState.message}
              </p>
            ) : null}
          </form>
        ) : (
          <button
            type="button"
            className={styles.forgotLink}
            onClick={() => setShowForgot(true)}
          >
            Forgot password?
          </button>
        )}
      </div>
    </>
  );
}
