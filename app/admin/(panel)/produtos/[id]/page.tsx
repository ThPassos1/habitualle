import { notFound } from "next/navigation";

import { ProductForm } from "@/components/admin/product-form";
import { getAdminProduct } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const result = await getAdminProduct(params.id);
  if (!result.ok) {
    return <p className="px-4 py-8 text-sm text-terracotta-600 md:px-10">{result.message}</p>;
  }
  if (!result.product) notFound();
  return <ProductForm product={result.product} />;
}
