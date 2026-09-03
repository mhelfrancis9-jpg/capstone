import "server-only";
import { getAdminClient } from "@/lib/supabase/admin";
import { missingServiceRoleMessage, toFriendlyDbError } from "@/lib/data/admin/errors";
import { type QueryResult } from "@/lib/data/types";

/**
 * Server-side data access for the Custom Bike Builder experience.
 *
 * Reads the builder step definitions and the products mapped to each step
 * through the admin (service-role) client so the public storefront never
 * depends on RLS edge cases while still returning only what is needed to
 * render the builder.
 */

export type BuilderAxis = {
  label: string;
  options: string[];
};

export type BuilderProduct = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specs: string[];
  price: number;
  image: string | null;
};

export type BuilderStep = {
  stepNumber: number;
  name: string;
  description: string;
  axes: BuilderAxis[];
  notice: string | null;
  /** Products the customer can pick for this step, ordered for display. */
  products: BuilderProduct[];
};

// Raw row shapes returned by the untyped PostgREST client. They are declared
// here so the mapping below stays fully typed (no `any`).
type ImageRow = { url: string; sort_order: number; is_primary: boolean };
type BuilderProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  specs: string[] | null;
  price: number | string;
  product_images: ImageRow[] | ImageRow | null;
};
type StepLinkRow = { sort_order: number; products: BuilderProductRow };
type StepRow = {
  step_number: number;
  name: string;
  description: string;
  customization_axes: BuilderAxis[] | null;
  notice: string | null;
  bike_builder_products: StepLinkRow[] | StepLinkRow | null;
};

/** PostgREST embeds a to-one relation as a single object, not an array. */
function asArray<T>(value: T[] | T | null | undefined): T[] {
  if (value === null || value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function primaryImage(
  images: ImageRow[] | ImageRow | null
): string | null {
  const list = asArray(images).sort((a, b) => a.sort_order - b.sort_order);
  const primary = list.find((image) => image.is_primary) ?? list[0];
  return primary?.url ?? null;
}

export async function getBikeBuilderSteps(): Promise<QueryResult<BuilderStep[]>> {
  const admin = getAdminClient();
  if (!admin) return { data: null, error: missingServiceRoleMessage() };

  const { data, error } = await admin
    .from("bike_builder_steps")
    .select(`
      step_number,
      name,
      description,
      customization_axes,
      notice,
      bike_builder_products(
        sort_order,
        products(
          id, name, slug, description, specs, price,
          product_images(url, sort_order, is_primary)
        )
      )
    `)
    .order("step_number", { ascending: true });

  if (error) {
    return { data: null, error: toFriendlyDbError(error) };
  }

  const steps = (data as unknown as StepRow[] | null) ?? [];

  const mapped: BuilderStep[] = steps.map((step) => {
    const links = asArray(step.bike_builder_products).sort(
      (a, b) => a.sort_order - b.sort_order
    );

    const products: BuilderProduct[] = links.map((link) => ({
      id: String(link.products.id),
      name: link.products.name,
      slug: link.products.slug,
      description: link.products.description ?? null,
      specs: link.products.specs ?? [],
      price: Number(link.products.price),
      image: primaryImage(link.products.product_images),
    }));

    return {
      stepNumber: Number(step.step_number),
      name: step.name,
      description: step.description,
      axes: step.customization_axes ?? [],
      notice: step.notice ?? null,
      products,
    };
  });

  return { data: mapped, error: null };
}

