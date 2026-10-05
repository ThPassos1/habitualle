import "server-only";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";

import { adminSessionValid } from "@/lib/admin-session";
import { ADMIN_COOKIE } from "@/lib/auth";
import { getCategory, type CategorySlug } from "@/lib/categories";
import { getProduct, products, type AdminProduct, type Product, type Review } from "@/lib/products";
import type { ParsedProduct } from "@/lib/product-draft";
import { supabaseAdmin, supabaseSetupMessage } from "@/lib/supabase/admin";

const SELECT = `
  id, title, description, price, promo_price, images, category, stock,
  tagline, featured, published, colors, sizes, details, solution_title, solution,
  sku, supplier, rating, review_count, reviews
`;

type ProductRow = {
  id: string;
  title: string;
  description: string | null;
  price: number | string;
  promo_price: number | string | null;
  images: string[] | null;
  category: string;
  stock: number;
  tagline: string | null;
  featured: boolean | null;
  published: boolean | null;
  colors: string[] | null;
  sizes: string[] | null;
  details: string[] | null;
  solution_title: string | null;
  solution: string[] | null;
  sku: string | null;
  supplier: string | null;
  rating: number | string | null;
  review_count: number | null;
  reviews: unknown;
};

type Ok<T> = { ok: true } & T;
type Err = { ok: false; message: string };

let seedFilled = false;

function money(value: number | string | null | undefined) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 0;
  return Math.round(amount * 100) / 100;
}

async function isAdmin() {
  return adminSessionValid(cookies().get(ADMIN_COOKIE)?.value);
}

function reviewsOf(value: unknown): Review[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const row = item as Record<string, unknown>;
    if (typeof row.author !== "string" || typeof row.text !== "string") return [];
    return [
      {
        author: row.author,
        city: typeof row.city === "string" ? row.city : "",
        rating: Number(row.rating) || 0,
        text: row.text,
      },
    ];
  });
}

function mapRow(row: ProductRow): AdminProduct | null {
  const category = getCategory(row.category)?.slug;
  if (!category) return null;
  const list = money(row.price);
  const promo = row.promo_price == null ? null : money(row.promo_price);
  const selling = promo ?? list;
  const images = (row.images ?? []).filter(Boolean).map((src) => ({ src, alt: row.title }));
  return {
    id: row.id,
    name: row.title,
    price: selling,
    compareAtPrice: promo != null && list > selling ? list : undefined,
    category: category as CategorySlug,
    featured: Boolean(row.featured),
    tagline: row.tagline ?? "",
    description: row.description ?? "",
    solutionTitle: row.solution_title ?? "",
    solution: row.solution ?? [],
    details: row.details ?? [],
    images,
    colors: row.colors?.length ? row.colors : ["Único"],
    sizes: row.sizes?.length ? row.sizes : ["Único"],
    rating: money(row.rating),
    reviewCount: row.review_count ?? 0,
    reviews: reviewsOf(row.reviews),
    supplier: row.supplier ?? "",
    sku: row.sku ?? "",
    stock: row.stock ?? 0,
    published: row.published !== false,
  };
}

function fromSeed(product: Product): AdminProduct {
  return { ...product, stock: 48, published: true };
}

function seedPayload(product: Product) {
  return {
    tagline: product.tagline,
    featured: product.featured,
    published: true,
    colors: product.colors,
    sizes: product.sizes,
    details: product.details,
    solution_title: product.solutionTitle,
    solution: product.solution,
    sku: product.sku,
    supplier: product.supplier,
    rating: product.rating,
    review_count: product.reviewCount,
    reviews: product.reviews,
  };
}

async function fillSeed() {
  if (seedFilled) return;
  const supabase = supabaseAdmin();
  if (!supabase) return;
  const { data, error } = await supabase.from("products").select("id").is("tagline", null).limit(30);
  if (error) return;
  if (!data?.length) {
    seedFilled = true;
    return;
  }
  for (const row of data) {
    const seed = getProduct(row.id);
    const patch = seed ? seedPayload(seed) : { tagline: "" };
    await supabase.from("products").update(patch).eq("id", row.id).is("tagline", null);
  }
  seedFilled = true;
}

function catalogError(message: string) {
  if (message.includes("tagline") || message.includes("published") || message.includes("schema cache")) {
    return "Falta a migração de produtos no Supabase. Rode supabase/migrations/20260930233000_product_catalog.sql no SQL Editor do habitualle.";
  }
  return "Não foi possível ler o catálogo agora.";
}

async function loadRows(): Promise<{ ok: true; rows: ProductRow[] } | Err> {
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false, message: supabaseSetupMessage("loja") };
  await fillSeed();
  const { data, error } = await supabase.from("products").select(SELECT).order("created_at", { ascending: true });
  if (error) return { ok: false, message: catalogError(error.message) };
  return { ok: true, rows: (data ?? []) as ProductRow[] };
}

function mapped(rows: ProductRow[]) {
  return rows.flatMap((row) => {
    const product = mapRow(row);
    return product ? [product] : [];
  });
}

export async function listStoreProducts(): Promise<AdminProduct[]> {
  const result = await loadRows();
  if (!result.ok) return products.map(fromSeed);
  return mapped(result.rows).filter((product) => product.published);
}

export async function listFeaturedProducts() {
  return (await listStoreProducts()).filter((product) => product.featured);
}

export async function listProductsByCategory(slug: CategorySlug) {
  return (await listStoreProducts()).filter((product) => product.category === slug);
}

export async function getStoreProduct(id: string) {
  return (await listStoreProducts()).find((product) => product.id === id) ?? null;
}

export async function getRelatedStoreProducts(id: string, limit = 3) {
  const items = await listStoreProducts();
  const current = items.find((product) => product.id === id);
  if (!current) return items.slice(0, limit);
  const same = items.filter((product) => product.category === current.category && product.id !== id);
  const others = items.filter((product) => product.id !== id && product.category !== current.category);
  return [...same, ...others].slice(0, limit);
}

export async function getSellableProduct(id: string): Promise<AdminProduct | null> {
  const supabase = supabaseAdmin();
  if (!supabase) {
    const seed = getProduct(id);
    return seed ? fromSeed(seed) : null;
  }
  await fillSeed();
  const { data, error } = await supabase.from("products").select(SELECT).eq("id", id).maybeSingle();
  if (error) {
    const seed = getProduct(id);
    return seed ? fromSeed(seed) : null;
  }
  if (!data) return null;
  const product = mapRow(data as ProductRow);
  if (!product?.published) return null;
  return product;
}

export async function listAdminProducts(): Promise<Ok<{ products: AdminProduct[] }> | Err> {
  if (!(await isAdmin())) return { ok: false, message: "Sua sessão de admin expirou. Entre de novo." };
  const result = await loadRows();
  if (!result.ok) return result;
  return { ok: true, products: mapped(result.rows) };
}

export async function getAdminProduct(id: string): Promise<Ok<{ product: AdminProduct | null }> | Err> {
  if (!(await isAdmin())) return { ok: false, message: "Sua sessão de admin expirou. Entre de novo." };
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false, message: supabaseSetupMessage("admin") };
  await fillSeed();
  const { data, error } = await supabase.from("products").select(SELECT).eq("id", id).maybeSingle();
  if (error) return { ok: false, message: catalogError(error.message) };
  return { ok: true, product: data ? mapRow(data as ProductRow) : null };
}

function detectedImage(bytes: Buffer): { ext: "jpg" | "png" | "webp"; type: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { ext: "jpg", type: "image/jpeg" };
  }
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(png)) return { ext: "png", type: "image/png" };
  if (
    bytes.length >= 12 &&
    bytes.subarray(0, 4).toString("ascii") === "RIFF" &&
    bytes.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return { ext: "webp", type: "image/webp" };
  }
  return null;
}

async function uploadPhotos(id: string, files: File[]) {
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false as const, message: supabaseSetupMessage("admin") };
  const urls: string[] = [];
  for (const file of files) {
    if (file.size > 2_097_152) return { ok: false as const, message: "Cada foto pode ter até 2 MB." };
    const body = Buffer.from(await file.arrayBuffer());
    const image = detectedImage(body);
    if (!image) return { ok: false as const, message: "Use fotos JPG, PNG ou WebP." };
    const path = `${id}/${randomUUID()}.${image.ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, body, {
      contentType: image.type,
      upsert: false,
    });
    if (error) return { ok: false as const, message: "Não foi possível guardar a foto. Tente de novo ou cole um link https." };
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return { ok: true as const, urls };
}

export async function saveCatalogProduct(
  product: ParsedProduct,
  files: File[],
  creating: boolean,
): Promise<Ok<{ id: string }> | Err> {
  if (!(await isAdmin())) return { ok: false, message: "Sua sessão de admin expirou. Entre de novo." };
  if (product.imageUrls.length + files.length === 0) {
    return { ok: false, message: "Adicione ao menos uma foto." };
  }
  if (product.imageUrls.length + files.length > 4) {
    return { ok: false, message: "Use no máximo 4 fotos." };
  }
  const uploaded = await uploadPhotos(product.id, files);
  if (!uploaded.ok) return uploaded;
  const images = [...product.imageUrls, ...uploaded.urls];

  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false, message: supabaseSetupMessage("admin") };

  const row = {
    title: product.name,
    description: product.description,
    price: product.compareAtPrice ?? product.price,
    promo_price: product.compareAtPrice ? product.price : null,
    images,
    category: product.category,
    stock: product.stock,
    tagline: product.tagline,
    featured: product.published && product.featured,
    published: product.published,
    colors: product.colors,
    sizes: product.sizes,
    details: product.details,
    solution_title: product.solutionTitle,
    solution: product.solution,
    sku: product.sku,
    supplier: product.supplier,
  };

  if (creating) {
    const { error } = await supabase.from("products").insert({
      id: product.id,
      ...row,
      rating: 0,
      review_count: 0,
      reviews: [],
    });
    if (error?.code === "23505") return { ok: false, message: "Já existe uma peça com esse endereço." };
    if (error) return { ok: false, message: catalogError(error.message) };
    return { ok: true, id: product.id };
  }

  const { data, error } = await supabase.from("products").update(row).eq("id", product.id).select("id").maybeSingle();
  if (error) return { ok: false, message: catalogError(error.message) };
  if (!data) return { ok: false, message: "Produto não encontrado." };
  return { ok: true, id: product.id };
}

export async function deleteCatalogProduct(id: string): Promise<Ok<{ id: string }> | Err> {
  if (!(await isAdmin())) return { ok: false, message: "Sua sessão de admin expirou. Entre de novo." };
  const supabase = supabaseAdmin();
  if (!supabase) return { ok: false, message: supabaseSetupMessage("admin") };
  const { count, error: countError } = await supabase
    .from("order_items")
    .select("id", { count: "exact", head: true })
    .eq("product_id", id);
  if (countError) return { ok: false, message: "Não foi possível excluir agora." };
  if (count && count > 0) {
    return { ok: false, message: "Este produto já entrou em pedidos. Oculte da loja em vez de excluir." };
  }
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, message: "Não foi possível excluir agora." };
  return { ok: true, id };
}
