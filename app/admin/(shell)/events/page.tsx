import type { Metadata } from "next";
import { listAdminEvents } from "@/lib/data/admin/events";
import EventsManager from "@/components/admin/events/EventsManager";

export const metadata: Metadata = {
  title: "Events | LnR Cycle Center",
};

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  const result = await listAdminEvents();

  return (
    <EventsManager
      initialEvents={result.data ?? []}
      error={result.error ?? undefined}
    />
  );
}
