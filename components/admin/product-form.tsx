"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState, type ReactNode } from "react";

import { removeAdminProduct, saveAdminProduct } from "@/app/actions/products";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/categories";
import { productSlug, type AdminProduct } from "@/lib/products";
import type { ProductDraft } from "@/lib/product-draft";

const fieldClass =
  "h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-sm text-stone-800 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-400";

export function ProductForm({ product }: { product: AdminProduct | null }) {
  const router = useRouter();
  const creating = product == null;
  const [slugTouched, setSlugTouched] = useState(!creating);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.id ?? "");
  const [category, setCategory] = useState(product?.category ?? "cozinha-pratica");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [compareAt, setCompareAt] = useState(product?.compareAtPrice ? String(product.compareAtPrice) : "");
  const [stock, setStock] = useState(product ? String(product.stock) : "10");
  const [colors, setColors] = useState(product?.colors.join(", ") ?? "Único");
  const [sizes, setSizes] = useState(product?.sizes.join(", ") ?? "Único");
  const [tagline, setTagline] = useState(product?.tagline ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [details, setDetails] = useState(product?.details.join("\n") ?? "");
  const [solutionTitle, setSolutionTitle] = useState(product?.solutionTitle ?? "");
  const [solution, setSolution] = useState(product?.solution.join("\n\n") ?? "");
  const [sku, setSku] = useState(product?.sku ?? "");
  const [supplier, setSupplier] = useState(product?.supplier ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [published, setPublished] = useState(product?.published ?? true);
  const [imageUrls, setImageUrls] = useState(product?.images.map((image) => image.src) ?? []);
  const [link, setLink] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function onName(value: string) {
    setName(value);
    if (!slugTouched) setSlug(productSlug(value));
  }

  function addLink() {
    const url = link.trim();
    if (!url) return;
    setImageUrls((current) => (current.includes(url) ? current : [...current, url]));
    setLink("");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setError(null);
    const draft: ProductDraft = {
      id: slug,
      name,
      category,
      price,
      compareAtPrice: compareAt,
      stock,
      featured,
      published,
      colors,
      sizes,
      imageUrls,
      tagline,
      description,
      details,
      solutionTitle,
      solution,
      sku,
      supplier,
    };
    const body = new FormData();
    body.set("creating", creating ? "1" : "0");
    body.set("payload", JSON.stringify(draft));
    files.forEach((file) => body.append("photos", file));
    setPending(true);
    const result = await saveAdminProduct(body);
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/admin/produtos");
    router.refresh();
  }

  async function onDelete() {
    if (!product || pending) return;
    if (!window.confirm("Excluir esta peça da loja?")) return;
    setPending(true);
    const result = await removeAdminProduct(product.id, product.category);
    setPending(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <>
      <AdminHeader
        title={creating ? "Nova peça" : product.name}
        description="Publicada, a peça entra na coleção e na categoria. Com destaque, também aparece na home, em Favoritos da semana. O endereço vira a página do produto."
      />
      <form onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-8 px-4 py-8 md:px-10">
        {error && (
          <p className="rounded-md border border-terracotta-200 bg-terracotta-50 px-4 py-3 text-sm text-terracotta-600" role="alert">
            {error}
          </p>
        )}

        <section className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" className="sm:col-span-2">
            <Input value={name} onChange={(event) => onName(event.target.value)} required />
          </Field>
          <Field label="Endereço na loja" hint={slug ? `/product/${slug}` : "Gerado a partir do nome"}>
            <Input
              value={slug}
              disabled={!creating}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(productSlug(event.target.value));
              }}
            />
          </Field>
          <Field label="Categoria">
            <select className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value as AdminProduct["category"])}>
              {categories.map((item) => (
                <option key={item.slug} value={item.slug}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Preço cobrado">
            <Input inputMode="decimal" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="189" required />
          </Field>
          <Field label="Preço riscado" hint="Opcional. Só aparece se for maior que o preço cobrado.">
            <Input inputMode="decimal" value={compareAt} onChange={(event) => setCompareAt(event.target.value)} placeholder="229" />
          </Field>
          <Field label="Estoque">
            <Input inputMode="numeric" value={stock} onChange={(event) => setStock(event.target.value)} required />
          </Field>
          <Field label="Fornecedor" hint="Só a equipe vê. Ajuda a separar o pedido.">
            <Input value={supplier} onChange={(event) => setSupplier(event.target.value)} placeholder="CJ Dropshipping" />
          </Field>
          <Field label="SKU">
            <Input value={sku} onChange={(event) => setSku(event.target.value.toUpperCase())} placeholder="HAB-001" />
          </Field>
          <Field label="Cores" hint="Separe por vírgula. Ex.: Areia, Off-white" className="sm:col-span-2">
            <Input value={colors} onChange={(event) => setColors(event.target.value)} />
          </Field>
          <Field label="Tamanhos" hint="Se não houver variação, deixe Único." className="sm:col-span-2">
            <Input value={sizes} onChange={(event) => setSizes(event.target.value)} />
          </Field>
        </section>

        <section className="space-y-4">
          <Field label="Fotos" hint="Até 4. Envie um arquivo ou cole um link https.">
            <Input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
          </Field>
          <div className="flex gap-2">
            <Input
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://..."
              aria-label="Link da foto"
            />
            <Button type="button" variant="outline" onClick={addLink}>
              Adicionar link
            </Button>
          </div>
          {imageUrls.length > 0 && (
            <ul className="space-y-2">
              {imageUrls.map((url) => (
                <li key={url} className="flex items-center justify-between gap-3 text-sm text-stone-600">
                  <span className="truncate">{url}</span>
                  <button
                    type="button"
                    className="shrink-0 text-stone-500 underline underline-offset-4"
                    onClick={() => setImageUrls((current) => current.filter((item) => item !== url))}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>
          )}
          {files.length > 0 && <p className="text-sm text-stone-500">{files.length} arquivo(s) novo(s) para enviar.</p>}
        </section>

        <section className="grid gap-4">
          <Field label="Frase curta" hint="Aparece na busca e no resumo da página.">
            <Input value={tagline} onChange={(event) => setTagline(event.target.value)} />
          </Field>
          <Field label="Descrição">
            <textarea className={`${fieldClass} h-28 py-3`} value={description} onChange={(event) => setDescription(event.target.value)} />
          </Field>
          <Field label="Detalhes" hint="Um por linha. Medidas, material, cuidado.">
            <textarea className={`${fieldClass} h-28 py-3`} value={details} onChange={(event) => setDetails(event.target.value)} />
          </Field>
          <Field label="Título da solução" hint="Opcional. Abre o bloco de texto no fim da página.">
            <Input value={solutionTitle} onChange={(event) => setSolutionTitle(event.target.value)} />
          </Field>
          <Field label="Texto da solução" hint="Separe os parágrafos com uma linha em branco.">
            <textarea className={`${fieldClass} h-32 py-3`} value={solution} onChange={(event) => setSolution(event.target.value)} />
          </Field>
        </section>

        <div className="flex flex-col gap-3 text-sm text-stone-700">
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={published} onChange={(event) => setPublished(event.target.checked)} />
            Visível na loja
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} />
            Destaque na página inicial
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando…" : "Salvar peça"}
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/produtos">Voltar</Link>
          </Button>
          {!creating && (
            <button type="button" className="text-sm text-stone-500 underline underline-offset-4" onClick={() => void onDelete()} disabled={pending}>
              Excluir
            </button>
          )}
        </div>
      </form>
    </>
  );
}

function Field({
  label,
  hint,
  className,
  children,
}: {
  label: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-stone-500">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-stone-500">{hint}</span>}
    </label>
  );
}
