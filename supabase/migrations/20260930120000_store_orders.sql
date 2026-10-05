-- Habitualle: catálogo, pedidos e itens.
-- No Supabase, abra SQL Editor, cole este arquivo e execute uma vez.
-- A chave service_role fica só no servidor (SUPABASE_SERVICE_ROLE_KEY).
-- O anon não lê pedidos: a loja consulta pelo servidor.

create table if not exists public.products (
  id text primary key,
  title text not null,
  description text not null default '',
  price numeric(10, 2) not null check (price >= 0),
  promo_price numeric(10, 2) check (promo_price is null or promo_price >= 0),
  images text[] not null default '{}',
  category text not null,
  stock integer not null default 0 check (stock >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key check (id ~ '^HB-[0-9]{4,6}$'),
  customer_name text not null,
  customer_email text not null,
  customer_cpf text not null,
  customer_phone text not null,
  shipping_address jsonb not null,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  shipping_cost numeric(10, 2) not null check (shipping_cost >= 0),
  status text not null default 'pendente' check (
    status in ('pendente', 'pago', 'processando', 'enviado', 'entregue', 'cancelado')
  ),
  tracking_code text,
  payment_id text,
  payment_status text,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders (id) on delete cascade,
  product_id text not null references public.products (id),
  quantity integer not null check (quantity > 0 and quantity <= 10),
  price numeric(10, 2) not null check (price >= 0),
  variant_color text not null default '',
  variant_size text not null default ''
);

create index if not exists orders_customer_email_idx on public.orders (customer_email);
create index if not exists orders_customer_cpf_idx on public.orders (customer_cpf);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists order_items_order_id_idx on public.order_items (order_id);

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select
  to anon, authenticated
  using (true);

-- price = valor de tabela; promo_price = valor cobrado quando há desconto.
insert into public.products (id, title, description, price, promo_price, images, category, stock)
values
  (
    'potes-aurora',
    'Conjunto Potes Aurora',
    'Quatro potes de vidro com tampa de bambu para grãos, biscoitos e o que some no fundo da despensa.',
    229,
    189,
    array[
      'https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1400&q=80'
    ],
    'cozinha-pratica',
    48
  ),
  (
    'organizador-nido',
    'Organizador Nido',
    'Módulos baixos que separam talheres, sachês e o que hoje vive solto na gaveta.',
    159,
    null,
    array[
      'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1594026112284-02bb6f3352fe?auto=format&fit=crop&w=1400&q=80'
    ],
    'organizacao',
    48
  ),
  (
    'panos-linho',
    'Panos de Linho Bruma',
    'Trio de linho lavado para bancada, mesa e a mão que acabou de enxaguar a xícara.',
    119,
    null,
    array[
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=80'
    ],
    'limpeza-inteligente',
    48
  ),
  (
    'difusor-serra',
    'Difusor Serra',
    'Difusor de cerâmica com varetas, para a sala ou o quarto, sem tomada e sem luz piscando.',
    249,
    null,
    array[
      'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1400&q=80'
    ],
    'bem-estar',
    48
  ),
  (
    'luminaria-linho',
    'Luminária Linho',
    'Cúpula de linho e base de cerâmica. Acende o canto da poltrona e deixa o resto na penumbra.',
    379,
    329,
    array[
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1400&q=80'
    ],
    'bem-estar',
    48
  ),
  (
    'cesto-bruma',
    'Cesto Bruma',
    'Cesto alto de algodão trançado para a sala ou o quarto de hóspedes.',
    139,
    null,
    array[
      'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=1400&q=80'
    ],
    'organizacao',
    48
  ),
  (
    'toalhas-areia',
    'Jogo de Toalhas Areia',
    'Jogo macio em algodão, na cor que combina com pedra, madeira e luz da manhã.',
    219,
    null,
    array[
      'https://images.unsplash.com/photo-1631889993959-41b4e8a866f0?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1400&q=80'
    ],
    'bem-estar',
    48
  ),
  (
    'tabua-carvalho',
    'Tábua Carvalho',
    'Tábua de madeira com canal raso, para o pão, o limão e o que for para a panela.',
    169,
    null,
    array[
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=1400&q=80',
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?auto=format&fit=crop&w=1400&q=80'
    ],
    'cozinha-pratica',
    48
  )
on conflict (id) do nothing;

insert into public.orders (
  id, customer_name, customer_email, customer_cpf, customer_phone,
  shipping_address, total_amount, shipping_cost, status, tracking_code, created_at
)
values
  (
    'HB-1048', 'Ana Clara Mendonça', 'ana.mendonca@exemplo.com', '412.558.390-28', '(11) 98821-4402',
    '{"street":"Rua Harmonia","number":"418","complement":"Apto 32","neighborhood":"Vila Madalena","city":"São Paulo","state":"SP","zip":"05435-000"}'::jsonb,
    218, 29, 'pago', null, '2026-09-28T15:10:00Z'
  ),
  (
    'HB-1047', 'Ricardo Alves Prado', 'ricardo.prado@exemplo.com', '305.112.748-10', '(41) 99120-3381',
    '{"street":"Rua Padre Anchieta","number":"1260","complement":"","neighborhood":"Mercês","city":"Curitiba","state":"PR","zip":"80410-030"}'::jsonb,
    578, 0, 'processando', null, '2026-09-28T11:40:00Z'
  ),
  (
    'HB-1046', 'Juliana Pires', 'juliana.pires@exemplo.com', '198.667.234-55', '(31) 98455-2190',
    '{"street":"Rua Fernandes Tourinho","number":"88","complement":"Apto 701","neighborhood":"Savassi","city":"Belo Horizonte","state":"MG","zip":"30112-000"}'::jsonb,
    188, 29, 'pendente', null, '2026-09-27T18:05:00Z'
  ),
  (
    'HB-1045', 'Camila Duarte Nunes', 'camila.nunes@exemplo.com', '276.441.908-33', '(21) 99710-6624',
    '{"street":"Rua Barão de Jaguaribe","number":"215","complement":"","neighborhood":"Ipanema","city":"Rio de Janeiro","state":"RJ","zip":"22421-000"}'::jsonb,
    248, 29, 'enviado', 'OJ458221739BR', '2026-09-26T13:22:00Z'
  ),
  (
    'HB-1044', 'Fernando Rocha', 'fernando.rocha@exemplo.com', '523.778.160-90', '(51) 99208-1143',
    '{"street":"Rua Padre Chagas","number":"79","complement":"Casa","neighborhood":"Moinhos de Vento","city":"Porto Alegre","state":"RS","zip":"90570-080"}'::jsonb,
    168, 29, 'entregue', 'OJ102938475BR', '2026-09-24T09:15:00Z'
  ),
  (
    'HB-1043', 'Beatriz Nogueira', 'beatriz.nogueira@exemplo.com', '641.903.557-21', '(61) 98144-7702',
    '{"street":"SQS 308 Bloco C","number":"102","complement":"","neighborhood":"Asa Sul","city":"Brasília","state":"DF","zip":"70355-030"}'::jsonb,
    317, 29, 'pago', null, '2026-09-23T16:48:00Z'
  ),
  (
    'HB-1042', 'Lucas Ferreira', 'lucas.ferreira@exemplo.com', '387.220.814-66', '(71) 99330-5581',
    '{"street":"Rua Chile","number":"44","complement":"Loja 2","neighborhood":"Comércio","city":"Salvador","state":"BA","zip":"40020-000"}'::jsonb,
    329, 0, 'processando', null, '2026-09-22T12:03:00Z'
  ),
  (
    'HB-1041', 'Marina Costa', 'marina.costa@exemplo.com', '159.334.672-04', '(81) 98876-2209',
    '{"street":"Rua da Aurora","number":"590","complement":"Casa 2","neighborhood":"Boa Vista","city":"Recife","state":"PE","zip":"50060-010"}'::jsonb,
    378, 0, 'enviado', 'NX883344221BR', '2026-09-20T19:30:00Z'
  )
on conflict (id) do nothing;

insert into public.order_items (order_id, product_id, quantity, price, variant_color, variant_size)
select v.order_id, v.product_id, v.quantity, v.price, v.variant_color, v.variant_size
from (
  values
    ('HB-1048', 'potes-aurora', 1, 189::numeric, 'Areia', 'Único'),
    ('HB-1047', 'difusor-serra', 1, 249::numeric, 'Terracota', 'Único'),
    ('HB-1047', 'luminaria-linho', 1, 329::numeric, 'Areia', 'Único'),
    ('HB-1046', 'organizador-nido', 1, 159::numeric, 'Sálvia', 'Único'),
    ('HB-1045', 'toalhas-areia', 1, 219::numeric, 'Areia', 'Banho'),
    ('HB-1044', 'cesto-bruma', 1, 139::numeric, 'Carvalho', 'Único'),
    ('HB-1043', 'panos-linho', 1, 119::numeric, 'Off-white', 'Único'),
    ('HB-1043', 'tabua-carvalho', 1, 169::numeric, 'Carvalho', 'Único'),
    ('HB-1042', 'luminaria-linho', 1, 329::numeric, 'Terracota', 'Único'),
    ('HB-1041', 'potes-aurora', 2, 189::numeric, 'Off-white', 'Único')
) as v(order_id, product_id, quantity, price, variant_color, variant_size)
where not exists (
  select 1
  from public.order_items oi
  where oi.order_id = v.order_id
    and oi.product_id = v.product_id
    and oi.variant_color = v.variant_color
    and oi.variant_size = v.variant_size
);

create or replace function public.create_store_order(
  p_id text,
  p_customer_name text,
  p_customer_email text,
  p_customer_cpf text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_total_amount numeric,
  p_shipping_cost numeric,
  p_items jsonb
) returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  v_product_id text;
  v_qty integer;
  i integer;
begin
  if p_id !~ '^HB-[0-9]{6}$' then
    raise exception 'Número de pedido inválido';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Pedido sem itens';
  end if;

  insert into public.orders (
    id, customer_name, customer_email, customer_cpf, customer_phone,
    shipping_address, total_amount, shipping_cost, status
  ) values (
    p_id, p_customer_name, p_customer_email, p_customer_cpf, p_customer_phone,
    p_shipping_address, p_total_amount, p_shipping_cost, 'pendente'
  );

  for i in 0 .. jsonb_array_length(p_items) - 1
  loop
    item := p_items -> i;
    v_product_id := item->>'product_id';
    v_qty := (item->>'quantity')::integer;

    if v_qty is null or v_qty < 1 or v_qty > 10 then
      raise exception 'Quantidade inválida';
    end if;

    if not exists (select 1 from public.products where id = v_product_id) then
      raise exception 'Produto indisponível: %', v_product_id;
    end if;

    update public.products
      set stock = stock - v_qty
      where id = v_product_id
        and stock >= v_qty;

    if not found then
      raise exception 'Estoque insuficiente para %', v_product_id;
    end if;

    insert into public.order_items (
      order_id, product_id, quantity, price, variant_color, variant_size
    ) values (
      p_id,
      v_product_id,
      v_qty,
      (item->>'price')::numeric,
      coalesce(item->>'variant_color', ''),
      coalesce(item->>'variant_size', '')
    );
  end loop;

  return p_id;
end;
$$;

revoke all on function public.create_store_order(text, text, text, text, text, jsonb, numeric, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.create_store_order(text, text, text, text, text, jsonb, numeric, numeric, jsonb) to service_role;
