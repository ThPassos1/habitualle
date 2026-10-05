"use server";

import { revalidatePath } from "next/cache";

import { deleteCatalogProduct, saveCatalogProduct } from "@/lib/catalog";
import { parseProductDraft, type ProductDraft } from "@/lib/product-draft";

function revalidateProduct(id: string, category: string) {
  revalidatePath("/");
  revalidatePath("/colecao");
  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${id}`);
  revalidatePath(`/product/${id}`);
  revalidatePath(`/categoria/${category}`);
}

export async function saveAdminProduct(formData: FormData) {
  const raw = formData.get("payload");
  if (typeof raw !== "string") return { ok: false as const, message: "Não foi possível ler o cadastro." };
  let draft: ProductDraft;
  try {
    draft = JSON.parse(raw) as ProductDraft;
  } catch {
    return { ok: false as const, message: "Não foi possível ler o cadastro." };
  }
  const creating = formData.get("creating") === "1";
  const parsed = parseProductDraft(draft, creating);
  if (!parsed.ok) return parsed;
  const files = formData
    .getAll("photos")
    .filter((item): item is File => item instanceof File && item.size > 0);
  const saved = await saveCatalogProduct(parsed.value, files, creating);
  if (saved.ok) revalidateProduct(saved.id, parsed.value.category);
  return saved;
}

export async function removeAdminProduct(id: string, category: string) {
  const removed = await deleteCatalogProduct(id);
  if (removed.ok) revalidateProduct(id, category);
  return removed;
}
