"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { sanitizeNext } from "@/lib/navigation";
import { getOrCreateCustomer } from "@/lib/data/customer/customers";
import { upsertCustomerLocation } from "@/lib/data/customer/locations";

export type LocationState = {
  error: string | null;
};

export async function saveCustomerLocation(
  prevState: LocationState | undefined,
  formData: FormData
): Promise<LocationState> {
  const supabase = await createClient();

  if (!supabase) {
    return {
      error: "Supabase is not configured. Please refresh and try again.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in to save a delivery location." };
  }

  const customer = await getOrCreateCustomer(user);

  if (!customer) {
    return {
      error: "We couldn't load your customer account. Please try again.",
    };
  }

  const label = String(formData.get("label") ?? "").trim() || null;
  const address = String(formData.get("address") ?? "").trim();

  const latitude = Number(formData.get("latitude") ?? NaN);
  const longitude = Number(formData.get("longitude") ?? NaN);

  const rawAccuracy = String(
    formData.get("locationAccuracy") ?? ""
  ).trim();

  const locationAccuracy = rawAccuracy ? Number(rawAccuracy) : null;

  if (!address) {
    return { error: "Please enter your delivery address." };
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      error:
        "Please use your current location or search for an address to pin your delivery spot.",
    };
  }

  // Only reject a poor GPS/network fix when an accuracy value was supplied.
  // A manually selected map pin has no browser GPS accuracy and is therefore
  // allowed through.
  if (
    locationAccuracy !== null &&
    (!Number.isFinite(locationAccuracy) || locationAccuracy < 0)
  ) {
    return {
      error:
        "The detected location accuracy was invalid. Please try locating again or place the pin manually.",
    };
  }

  if (locationAccuracy !== null && locationAccuracy > 150) {
    return {
      error:
        "Your detected location is too approximate for delivery. Please move the pin to your exact location on the map and save again.",
    };
  }

  const result = await upsertCustomerLocation(customer.id, {
    label,
    address,
    latitude,
    longitude,
  });

  if (result.error) {
    return { error: result.error };
  }

  const next = sanitizeNext(
    String(formData.get("next") ?? ""),
    "/profile"
  );

  redirect(next);
}
