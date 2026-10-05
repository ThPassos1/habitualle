-- Campos para cadastrar produto pelo admin e exibir na loja.
-- Pode executar de novo no SQL Editor do projeto habitualle.

alter table public.products
  add column if not exists tagline text,
  add column if not exists featured boolean not null default false,
  add column if not exists published boolean not null default true,
  add column if not exists colors text[] not null default '{}',
  add column if not exists sizes text[] not null default '{}',
  add column if not exists details text[] not null default '{}',
  add column if not exists solution_title text,
  add column if not exists solution text[] not null default '{}',
  add column if not exists sku text not null default '',
  add column if not exists supplier text not null default '',
  add column if not exists rating numeric(2, 1) not null default 0,
  add column if not exists review_count integer not null default 0,
  add column if not exists reviews jsonb not null default '[]'::jsonb;

create index if not exists products_category_idx on public.products (category);

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select
  to anon, authenticated
  using (published = true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'product-images');
