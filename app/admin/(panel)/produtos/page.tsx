import { ProductsTable } from "@/components/admin/products-table";
import { listAdminProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const result = await listAdminProducts();
  return <ProductsTable products={result.ok ? result.products : []} error={result.ok ? null : result.message} />;
}
