import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * /admin → /admin/dashboard (the dashboard is the canonical home for the
 * admin area).
 */
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}
