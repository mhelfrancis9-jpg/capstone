import Link from "next/link";
import type { ComponentType } from "react";
import { IconProps } from "./icons";
import styles from "./AdminNavItem.module.css";

type AdminNavItemProps = {
  href: string;
  label: string;
  icon: ComponentType<IconProps>;
  /** Whether this item matches the current route. */
  active?: boolean;
  /** Opens the link in a new tab (used by "Visit Site"). */
  external?: boolean;
  /** Called after navigation (used to close the mobile drawer). */
  onClick?: () => void;
  /** Small red notification badge shown to the right of the label. */
  badge?: number;
};

/**
 * Reusable navigation row for the admin sidebar. Renders as a Link so
 * the active state can be driven by the current route via a prop.
 */
export default function AdminNavItem({
  href,
  label,
  icon: Icon,
  active = false,
  external = false,
  onClick,
  badge,
}: AdminNavItemProps) {
  return (
    <Link
      href={href}
      className={`${styles.item} ${active ? styles.active : ""}`}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <Icon size={22} />
      <span className={styles.label}>{label}</span>
      {badge && badge > 0 ? (
        <span className={styles.badge}>{badge > 99 ? "99+" : badge}</span>
      ) : null}
    </Link>
  );
}
