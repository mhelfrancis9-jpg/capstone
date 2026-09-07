import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Build a Bike | LNR Cycle Center",
  description: "Build your own custom bike at LNR Cycle Center.",
};

// Alias route: /build-a-bike → the existing custom bike builder.
// Reuses the real builder — no duplicate system is created here.
export const dynamic = "force-dynamic";

export default function BuildABikePage() {
  redirect("/custom-bike-builder");
}