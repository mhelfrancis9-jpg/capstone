import type { Metadata } from "next";
import Link from "next/link";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ProductCard from "@/components/customer/ProductCard";
import {
  getCatalogCategories,
  getCatalogProducts,
} from "@/lib/products";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Products | LNR Cycle Center",
  description:
    "Browse all bikes, parts and accessories at LNR Cycle Center — every product available in the store, live from the catalog.",
};

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    category?: string | string[] | undefined;
    q?: string | string[] | undefined;
  }>;
};

/**
 * Full storefront listing at `/products` — the destination for the header
 * "Products" link, the search box (`/products?q=...`) and every homepage
 * "View All" button. Supports optional `category` (category slug) and `q`
 * (free-text search) filters, both combinable.
 */
export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const categorySlug =
    typeof params.category === "string" ? params.category : undefined;
  const query = typeof params.q === "string" ? params.q : undefined;

  const [categories, products] = await Promise.all([
    getCatalogCategories(),
    getCatalogProducts({ categorySlug, query }),
  ]);

  const list = products ?? [];
  const currentCategory =
    categories?.find((category) => category.slug === categorySlug) ?? null;

  const searchQuery = (base: string) =>
    query ? `${base}${base.includes("?") ? "&" : "?"}q=${encodeURIComponent(query)}` : base;

  const heading = query
    ? currentCategory
      ? `${currentCategory.name} — search results for "${query}"`
      : `Search results for "${query}"`
    : currentCategory
      ? currentCategory.name
      : "Products";

  return (
    <div className={styles.page}>
      <CustomerHeader />

      <main>
        <section className={styles.section}>
          <div className={styles.container}>
            <h1 className={styles.title}>{heading}</h1>

            <nav className={styles.filters} aria-label="Filter products by category">
              <Link
                href={searchQuery("/products")}
                className={
                  categorySlug ? styles.filterLink : `${styles.filterLink} ${styles.filterActive}`
                }
              >
                All
              </Link>
              {(categories ?? []).map((category) => {
                const isActive = category.slug === categorySlug;
                return (
                  <Link
                    key={category.id}
                    href={searchQuery(`/products?category=${category.slug}`)}
                    className={
                      isActive
                        ? `${styles.filterLink} ${styles.filterActive}`
                        : styles.filterLink
                    }
                  >
                    {category.name}
                  </Link>
                );
              })}
            </nav>

            {list.length > 0 ? (
              <div className={styles.grid}>
                {list.map((product) => (
                  <ProductCard key={product.id} product={product} showCategory />
                ))}
              </div>
            ) : (
              <p className={styles.empty}>
                No products found
                {query ? ` for "${query}"` : ""}. Try a different category or
                search term.
              </p>
            )}
          </div>
        </section>
      </main>

      <CustomerFooter />
    </div>
  );
}
