import Link from "next/link";

import { AdminHeader } from "@/components/admin/admin-header";
import { StoreImage } from "@/components/store/store-image";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { categoryName } from "@/lib/categories";
import { formatBRL } from "@/lib/format";
import type { AdminProduct } from "@/lib/products";

export function ProductsTable({ products, error }: { products: AdminProduct[]; error: string | null }) {
  return (
    <>
      <AdminHeader
        title="Produtos"
        description="Cada peça publicada entra na coleção e na categoria escolhida. O destaque também aparece na home."
      />
      <div className="space-y-5 px-4 py-6 md:px-10 md:py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-stone-500">{products.length} peça(s) no catálogo</p>
          <Button asChild>
            <Link href="/admin/produtos/novo">Nova peça</Link>
          </Button>
        </div>
        {error && (
          <p className="rounded-md border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-600" role="alert">
            {error}
          </p>
        )}
        <div className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead className="hidden md:table-cell">Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead className="hidden sm:table-cell">Estoque</TableHead>
                <TableHead className="hidden lg:table-cell">Na loja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link href={`/admin/produtos/${product.id}`} className="flex items-center gap-3">
                      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md bg-sand-100">
                        {product.images[0] && <StoreImage src={product.images[0].src} alt="" />}
                      </div>
                      <span>
                        <span className="block font-medium text-stone-800">{product.name}</span>
                        <span className="text-xs text-stone-500">
                          {product.sku || product.id}
                          {product.featured ? " · Home" : ""}
                        </span>
                      </span>
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{categoryName(product.category)}</TableCell>
                  <TableCell>{formatBRL(product.price)}</TableCell>
                  <TableCell className="hidden sm:table-cell">{product.stock}</TableCell>
                  <TableCell className="hidden lg:table-cell text-stone-500">
                    {product.published ? "Visível" : "Oculta"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
}
