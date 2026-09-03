import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getAdminClient } from "@/lib/supabase/admin";
import type {
  EventRegistrationRow,
  EventRow,
  QueryResult,
} from "@/lib/data/types";
import { missingServiceRoleMessage, toFriendlyDbError } from "@/lib/data/admin/errors";

const EVENT_SELECT = `
  id, event_code, slug, title, category, description, event_date, end_date,
  location, banner_image_url, price, capacity, slots_booked, organizer,
  status, created_at, updated_at
`;

const REGISTRATION_SELECT = `
  id, registration_code, event_id, customer_id, customer_name, customer_email,
  customer_phone, rider_name, plate_number, category, amount_paid,
  payment_method, payment_status, status, proof_screenshot_url,
  rejection_reason, reviewed_at, reviewed_by, created_at, updated_at,
  event:events(id, slug, title, category, event_date, location, banner_image_url)
`;

/** Public storefront list — only published events, soonest first. */
export async function listPublishedEvents(): Promise<QueryResult<EventRow[]>> {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: null };

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("status", "published")
    .order("event_date", { ascending: true });

  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: (data as EventRow[]) ?? [], error: null };
}

/** Public storefront detail — only when the event is published. */
export async function getPublishedEventBySlug(
  slug: string
): Promise<QueryResult<EventRow | null>> {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: null };

  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: (data as EventRow) ?? null, error: null };
}

/** The signed-in customer's own registration for an event (RLS-scoped). */
export async function getOwnRegistrationForEvent(
  eventId: string,
  customerId: string
): Promise<QueryResult<EventRegistrationRow | null>> {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: null };

  const { data, error } = await supabase
    .from("event_registrations")
    .select(REGISTRATION_SELECT)
    .eq("event_id", eventId)
    .eq("customer_id", customerId)
    .maybeSingle();

  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: (data as unknown as EventRegistrationRow) ?? null, error: null };
}

/** The signed-in customer's own registration by code (RLS-scoped). */
export async function getEventRegistrationByCode(
  code: string
): Promise<QueryResult<EventRegistrationRow | null>> {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: null };

  const { data, error } = await supabase
    .from("event_registrations")
    .select(REGISTRATION_SELECT)
    .eq("registration_code", code)
    .maybeSingle();

  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: (data as unknown as EventRegistrationRow) ?? null, error: null };
}

/** The signed-in customer's registrations, newest first (RLS-scoped). */
export async function listMyEventRegistrations(
  customerId: string
): Promise<QueryResult<EventRegistrationRow[]>> {
  const supabase = await createClient();
  if (!supabase) return { data: null, error: null };

  const { data, error } = await supabase
    .from("event_registrations")
    .select(REGISTRATION_SELECT)
    .eq("customer_id", customerId)
    .order("created_at", { ascending: false });

  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: (data as unknown as EventRegistrationRow[]) ?? [], error: null };
}

function makeRegistrationCode(): string {
  const year = new Date().getFullYear();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `EVR-${year}-${rand}`;
}

export type CreateEventRegistrationInput = {
  eventId: string;
  customerId: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  riderName: string;
  plateNumber?: string | null;
  category?: string | null;
  amountPaid: number;
};

/**
 * Creates a registration for the given event (service-role write). Returns an
 * error when the event is full or the customer already registered.
 */
export async function createEventRegistration(
  input: CreateEventRegistrationInput
): Promise<QueryResult<{ registrationCode: string; paymentMethod: string }>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const { data: event, error: eventError } = await admin
    .from("events")
    .select("id, status, capacity, slots_booked, price")
    .eq("id", input.eventId)
    .maybeSingle();
  if (eventError) return { data: null, error: toFriendlyDbError(eventError) };
  if (!event) return { data: null, error: "This event is no longer available." };
  if (event.status !== "published")
    return { data: null, error: "This event is not open for registration." };
  if (
    Number(event.capacity) > 0 &&
    Number(event.slots_booked) >= Number(event.capacity)
  ) {
    return { data: null, error: "Sorry — this event is fully booked." };
  }

  // Prevent duplicate registrations for the same customer + event.
  const { data: existing } = await admin
    .from("event_registrations")
    .select("id")
    .eq("event_id", input.eventId)
    .eq("customer_id", input.customerId)
    .maybeSingle();
  if (existing)
    return { data: null, error: "You have already registered for this event." };

  let registration: { registration_code: string } | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 3 && !registration; attempt++) {
    const code = makeRegistrationCode();
    const { data, error } = await admin
      .from("event_registrations")
      .insert({
        registration_code: code,
        event_id: input.eventId,
        customer_id: input.customerId,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        rider_name: input.riderName,
        plate_number: input.plateNumber?.trim() || null,
        category: input.category?.trim() || null,
        amount_paid: input.amountPaid,
        payment_method: "gcash",
        payment_status: "pending",
        status: "registered",
        proof_screenshot_url: null,
      })
      .select("registration_code")
      .single();

    if (error) {
      if (error.code === "23505") {
        lastError = error; // duplicate code — retry with a fresh one
        continue;
      }
      return { data: null, error: toFriendlyDbError(error) };
    }
    registration = data as { registration_code: string };
  }

  if (!registration) return { data: null, error: toFriendlyDbError(lastError) };

  // Increment the booked slot count (best-effort).
  await admin
    .from("events")
    .update({ slots_booked: Number(event.slots_booked) + 1 })
    .eq("id", input.eventId);

  return {
    data: { registrationCode: registration.registration_code, paymentMethod: "gcash" },
    error: null,
  };
}

export type SubmitEventPaymentInput = {
  registrationCode: string;
  senderName: string;
  phoneNumber: string;
  referenceNumber?: string | null;
  screenshotUrl: string;
};

/** Saves the customer's GCash payment proof for an event registration. */
export async function submitEventGcashPayment(
  input: SubmitEventPaymentInput
): Promise<QueryResult<null>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const { error } = await admin
    .from("event_registrations")
    .update({
      proof_screenshot_url: input.screenshotUrl,
      payment_status: "pending",
      customer_name: input.senderName.trim(),
      customer_phone: input.phoneNumber.trim(),
    })
    .eq("registration_code", input.registrationCode)
    .eq("status", "registered");

  if (error) return { data: null, error: toFriendlyDbError(error) };
  return { data: null, error: null };
}

