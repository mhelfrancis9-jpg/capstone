import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CustomerHeader from "@/components/customer/CustomerHeader";
import CustomerFooter from "@/components/customer/CustomerFooter";
import ProductDetail from "@/components/customer/ProductDetail";
import { getCatalogProductBySlug } from "@/lib/products";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) {
    return { title: "Product Not Found | LNR Cycle Center" };
  }
  return {
    title: `${product.name} | LNR Cycle Center`,
    description: product.description ?? product.tagline[0],
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) notFound();

  return (
    <>
      <CustomerHeader />
      <ProductDetail product={product} />
      <CustomerFooter />
    </>
  );
}
