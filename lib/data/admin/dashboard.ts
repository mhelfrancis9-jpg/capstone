import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { type DashboardStats, type QueryResult } from "@/lib/data/types";
import { missingServiceRoleMessage, toFriendlyDbError } from "./errors";

export async function getDashboardStats(): Promise<
  QueryResult<DashboardStats>
> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  try {
    const startOfToday = new Date();
    startOfToday.setUTCHours(0, 0, 0, 0);

    const [products, newOrders, processingOrders, sales, lowStock] =
      await Promise.all([
        admin
          .from("products")
          .select("id", { count: "exact", head: true }),
        admin
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending"),
        admin
          .from("orders")
          .select("id", { count: "exact", head: true })
          .in("status", ["pending", "shipping"]),
        admin
          .from("orders")
          .select("total")
          .gte("created_at", startOfToday.toISOString())
          .not("status", "eq", "cancelled"),
        admin
          .from("products")
          .select("id", { count: "exact", head: true })
          .lt("stock", 5)
          .neq("status", "archived"),
      ]);

    const todaySales =
      (sales.data as { total: number }[] | null)?.reduce(
        (sum, row) => sum + Number(row.total),
        0
      ) ?? 0;

    // --- Event signals (real data, no placeholders) ---------------------------
    const nowIso = new Date().toISOString();

    const [{ data: nextEvent }, pendingSignups, draftEvents, outOfStock] =
      await Promise.all([
        admin
          .from("events")
          .select(
            "id, slug, title, event_date, capacity, slots_booked"
          )
          .eq("status", "published")
          .gte("event_date", nowIso)
          .order("event_date", { ascending: true })
          .limit(1)
          .maybeSingle(),
        admin
          .from("event_registrations")
          .select("id", { count: "exact", head: true })
          .eq("payment_status", "pending")
          .eq("status", "registered"),
        admin
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("status", "draft"),
        admin
          .from("products")
          .select("id", { count: "exact", head: true })
          .eq("stock", 0)
          .neq("status", "archived"),
      ]);

    const nextEventData = (nextEvent as
      | {
          id: string;
          slug: string;
          title: string;
          event_date: string;
          start_time: string | null;
          capacity: number;
          slots_booked: number;
        }
      | null) ?? null;

    return {
      data: {
        newOrders: newOrders.count ?? 0,
        processingOrders: processingOrders.count ?? 0,
        totalProducts: products.count ?? 0,
        todaySales,
        lowStockCount: lowStock.count ?? 0,
        nextEvent: nextEventData
          ? {
              id: nextEventData.id,
              title: nextEventData.title,
              slug: nextEventData.slug,
              eventDate: nextEventData.event_date,
              capacity: Number(nextEventData.capacity) || 0,
              slotsBooked: Number(nextEventData.slots_booked) || 0,
            }
          : null,
        pendingSignups: pendingSignups.count ?? 0,
        draftEvents: draftEvents.count ?? 0,
        outOfStock: outOfStock.count ?? 0,
      },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Failed to load dashboard stats.",
    };
  }
}

export type RevenueRange = "daily" | "weekly" | "monthly";

export type RevenuePoint = {
  label: string;
  value: number;
};

const REVENUE_BUCKETS: Record<RevenueRange, number> = {
  daily: 7,
  weekly: 8,
  monthly: 12,
};

/** 00:00 UTC of the given day. */
function startOfUtcDay(date: Date): Date {
  const copy = new Date(date);
  copy.setUTCHours(0, 0, 0, 0);
  return copy;
}

/** Monday 00:00 UTC of the week containing `date`. */
function startOfUtcWeek(date: Date): Date {
  const copy = startOfUtcDay(date);
  copy.setUTCDate(copy.getUTCDate() - ((copy.getUTCDay() + 6) % 7));
  return copy;
}

/** First day 00:00 UTC of the month containing `date`. */
function startOfUtcMonth(date: Date): Date {
  const copy = startOfUtcDay(date);
  copy.setUTCDate(1);
  return copy;
}

/**
 * Revenue per time bucket for the admin dashboard chart. Only non-cancelled
 * orders count as revenue. Buckets (daily → past 7 days, weekly → past 8
 * weeks, monthly → past 12 months) are computed server-side from real order
 * records so the chart never renders placeholder numbers.
 */
export async function getRevenueSeries(
  range: RevenueRange
): Promise<QueryResult<RevenuePoint[]>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  try {
    const count = REVENUE_BUCKETS[range];
    const now = new Date();
    const anchor =
      range === "daily"
        ? startOfUtcDay(now)
        : range === "weekly"
          ? startOfUtcWeek(now)
          : startOfUtcMonth(now);

    const buckets: { start: Date; end: Date; label: string }[] = [];
    for (let i = count - 1; i >= 0; i--) {
      const start = new Date(anchor);
      if (range === "daily") start.setUTCDate(start.getUTCDate() - i);
      else if (range === "weekly") start.setUTCDate(start.getUTCDate() - i * 7);
      else start.setUTCMonth(start.getUTCMonth() - i);

      const end = new Date(start);
      if (range === "daily") end.setUTCDate(end.getUTCDate() + 1);
      else if (range === "weekly") end.setUTCDate(end.getUTCDate() + 7);
      else end.setUTCMonth(end.getUTCMonth() + 1);

      buckets.push({
        start,
        end,
        label:
          range === "daily"
            ? start.toLocaleDateString("en-US", { weekday: "short" })
            : range === "weekly"
              ? start.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : start.toLocaleDateString("en-US", {
                  month: "short",
                  year: "2-digit",
                }),
      });
    }

    const { data, error } = await admin
      .from("orders")
      .select("created_at, total")
      .gte("created_at", buckets[0].start.toISOString())
      .not("status", "eq", "cancelled");

    if (error) return { data: null, error: toFriendlyDbError(error) };

    const rows = (data ?? []) as { created_at: string; total: number }[];
    const series = buckets.map((bucket) => {
      const value = rows.reduce((sum, row) => {
        const created = new Date(row.created_at);
        if (created >= bucket.start && created < bucket.end) {
          return sum + Number(row.total);
        }
        return sum;
      }, 0);
      return { label: bucket.label, value };
    });

    return { data: series, error: null };
  } catch (error) {
    return {
      data: null,
      error:
        error instanceof Error ? error.message : "Failed to load revenue analytics.",
    };
  }
}
