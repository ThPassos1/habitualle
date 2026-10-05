import { getCategory, type CategorySlug } from "@/lib/categories";
import { productSlug } from "@/lib/products";

export type ProductDraft = {
  id: string;
  name: string;
  category: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  featured: boolean;
  published: boolean;
  colors: string;
  sizes: string;
  imageUrls: string[];
  tagline: string;
  description: string;
  details: string;
  solutionTitle: string;
  solution: string;
  sku: string;
  supplier: string;
};

export type ParsedProduct = {
  id: string;
  name: string;
  category: CategorySlug;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  featured: boolean;
  published: boolean;
  colors: string[];
  sizes: string[];
  imageUrls: string[];
  tagline: string;
  description: string;
  details: string[];
  solutionTitle: string;
  solution: string[];
  sku: string;
  supplier: string;
};

const reserved = new Set(["novo", "editar", "admin"]);

function money(value: string) {
  const raw = value.trim();
  if (!raw) return null;
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const amount = Number(normalized);
  if (!Number.isFinite(amount)) return null;
  return Math.round(amount * 100) / 100;
}

function lines(value: string, max: number) {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, max);
}

function words(value: string, max: number) {
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, max);
}

function httpsUrl(value: string) {
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function parseProductDraft(
  draft: ProductDraft,
  creating: boolean,
): { ok: true; value: ParsedProduct } | { ok: false; message: string } {
  const name = draft.name.trim();
  const id = (creating ? draft.id.trim() || productSlug(name) : draft.id.trim()).toLowerCase();
  if (name.length < 3 || name.length > 80) return { ok: false, message: "O nome precisa ter entre 3 e 80 caracteres." };
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) || id.length > 48 || reserved.has(id)) {
    return { ok: false, message: "O endereço da peça usa só letras minúsculas, números e hífen." };
  }

  const category = getCategory(draft.category);
  if (!category) return { ok: false, message: "Escolha a categoria." };

  const price = money(draft.price);
  if (price == null || price <= 0 || price > 99999) {
    return { ok: false, message: "Informe o preço cobrado do cliente." };
  }
  const compareAtPrice = draft.compareAtPrice.trim() ? money(draft.compareAtPrice) : null;
  if (draft.compareAtPrice.trim() && (compareAtPrice == null || compareAtPrice <= price)) {
    return { ok: false, message: "O preço riscado precisa ser maior que o preço cobrado." };
  }

  const stock = Number(draft.stock);
  if (!Number.isInteger(stock) || stock < 0 || stock > 999) {
    return { ok: false, message: "O estoque fica entre 0 e 999." };
  }

  const colors = words(draft.colors, 8);
  const sizes = words(draft.sizes, 8);
  if (colors.length === 0 || colors.some((color) => color.length > 24)) {
    return { ok: false, message: "Informe ao menos uma cor, separada por vírgula." };
  }
  if (sizes.length === 0 || sizes.some((size) => size.length > 24)) {
    return { ok: false, message: "Informe ao menos um tamanho. Se não houver, use Único." };
  }

  const imageUrls = draft.imageUrls.map((url) => httpsUrl(url)).filter((url): url is string => Boolean(url));
  if (imageUrls.length !== draft.imageUrls.filter((url) => url.trim()).length) {
    return { ok: false, message: "Cada foto por link precisa ser um endereço https." };
  }

  const details = lines(draft.details, 8);
  const solution = draft.solution
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 3);
  if (draft.tagline.trim().length > 140) return { ok: false, message: "A frase curta passa de 140 caracteres." };
  if (draft.description.trim().length > 800) return { ok: false, message: "A descrição passa de 800 caracteres." };
  if (draft.solutionTitle.trim().length > 120) return { ok: false, message: "O título da solução passa de 120 caracteres." };
  if (draft.sku.trim().length > 40) return { ok: false, message: "O SKU passa de 40 caracteres." };
  if (draft.supplier.trim().length > 40) return { ok: false, message: "O fornecedor passa de 40 caracteres." };

  return {
    ok: true,
    value: {
      id,
      name,
      category: category.slug,
      price,
      compareAtPrice,
      stock,
      featured: draft.featured,
      published: draft.published,
      colors,
      sizes,
      imageUrls,
      tagline: draft.tagline.trim(),
      description: draft.description.trim(),
      details,
      solutionTitle: draft.solutionTitle.trim(),
      solution,
      sku: draft.sku.trim().toUpperCase(),
      supplier: draft.supplier.trim(),
    },
  };
}
