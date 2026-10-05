import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ProductDetail } from "@/components/store/product-detail";
import { categoryName } from "@/lib/categories";
import { getRelatedStoreProducts, getStoreProduct } from "@/lib/catalog";

type Props = { params: { id: string } };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getStoreProduct(params.id);
  if (!product) return { title: "Produto" };
  return { title: product.name, description: product.tagline || product.description };
}

export default async function ProductPage({ params }: Props) {
  const product = await getStoreProduct(params.id);
  if (!product) notFound();

  return (
    <ProductDetail
      product={product}
      categoryName={categoryName(product.category)}
      categoryHref={`/categoria/${product.category}`}
      related={await getRelatedStoreProducts(product.id)}
    />
  );
}
