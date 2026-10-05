import type { MetadataRoute } from "next";

import { listStoreProducts } from "@/lib/catalog";
import { categories } from "@/lib/categories";

function siteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`;
  const preview = process.env.VERCEL_URL?.trim();
  if (preview) return `https://${preview}`;
  return "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await listStoreProducts();
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/colecao`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/rastreio`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/ajuda`, lastModified: now, changeFrequency: "monthly", priority: 0.4 },
    ...categories.map((category) => ({
      url: `${base}/categoria/${category.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${base}/product/${product.id}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
