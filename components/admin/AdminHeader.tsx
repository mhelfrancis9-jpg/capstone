import type { User } from "@supabase/supabase-js";
import { UserIcon } from "./icons";
import styles from "./AdminHeader.module.css";

type AdminHeaderProps = {
  /** Signed-in administrator; null when user data is unavailable. */
  user: User | null;
};

/**
 * Top-right administrator identity block shown on every admin page.
 * Positioning inside the layout is handled by AdminLayout.
 */
export default function AdminHeader({ user }: AdminHeaderProps) {
  const meta = user?.user_metadata as Record<string, unknown> | undefined;
  const fullName =
    typeof meta?.full_name === "string" && meta.full_name.trim()
      ? meta.full_name
      : "Administrator";

  return (
    <div className={styles.header}>
      <div className={styles.text}>
        <p className={styles.name}>{fullName}</p>
      </div>
      <span className={styles.avatar} aria-hidden="true">
        <UserIcon size={20} />
      </span>
    </div>
  );
}
