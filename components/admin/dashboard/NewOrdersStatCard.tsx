"use client";

import Link from "next/link";
import { useNewOrders } from "../NewOrdersContext";
import styles from "./NewOrdersStatCard.module.css";

type NewOrdersStatCardProps = {
  /** Server-rendered new-orders count, used as the first-paint fallback. */
  initialCount: number;
};

/**
 * Live "New Orders" dashboard stat card. Reads the same real-time count as
 * the Admin sidebar badge (via NewOrdersContext) so the two always match.
 * Shows a red "NEW" indicator when there are pending orders the admin hasn't
 * viewed yet. Clicking it opens the Orders page, which clears the badge.
 */
export default function NewOrdersStatCard({
  initialCount,
}: NewOrdersStatCardProps) {
  const { count, unreadCount } = useNewOrders();

  // Use the server-rendered value until the first live poll returns.
  const value = count === 0 && initialCount > 0 ? initialCount : count;
  const hasUnread = unreadCount > 0;

  return (
    <Link
      href="/admin/orders"
      className={`${styles.card} ${hasUnread ? styles.cardNew : ""}`}
      aria-label="View new orders"
    >
      <p className={styles.cardLabel}>
        New Orders
        {hasUnread ? (
          <span className={styles.newBadge}>
            {unreadCount > 99 ? "99+" : unreadCount} new
          </span>
        ) : null}
      </p>
      <p className={styles.cardValue}>{value}</p>
    </Link>
  );
}
