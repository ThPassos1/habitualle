-- Idempotência do checkout e trava de valor.
-- Não reescreve pedidos já gravados.
-- Pode executar de novo no SQL Editor do projeto habitualle (hvotsqpiqcumzrpzpynm).
-- Substitui create_store_order: o preço continua saindo do catálogo, agora também
-- recusa preço negativo, mais de 20 itens e quantidade inválida.

create table if not exists public.checkout_attempts (
  idempotency_key text primary key,
  fingerprint text not null,
  order_id text unique references public.orders (id),
  created_at timestamptz not null default now(),
  constraint checkout_attempts_key_format check (
    idempotency_key ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
  ),
  constraint checkout_attempts_fingerprint_format check (fingerprint ~ '^[0-9a-f]{64}$')
);

alter table public.checkout_attempts enable row level security;

revoke all on table public.checkout_attempts from public, anon, authenticated;

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
  v_unit numeric;
  v_sum numeric := 0;
  i integer;
begin
  if p_id !~ '^HB-[0-9]{6}$' then
    raise exception 'Número de pedido inválido';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 20 then
    raise exception 'Pedido sem itens';
  end if;

  if p_total_amount is null or p_total_amount <= 0 or p_shipping_cost is null or p_shipping_cost < 0 then
    raise exception 'Total divergente';
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

    select coalesce(promo_price, price)
      into v_unit
      from public.products
      where id = v_product_id
        and published is true
      for update;

    if v_unit is null or v_unit <= 0 then
      raise exception 'Produto indisponível: %', v_product_id;
    end if;

    update public.products
      set stock = stock - v_qty
      where id = v_product_id
        and published is true
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
      v_unit,
      coalesce(item->>'variant_color', ''),
      coalesce(item->>'variant_size', '')
    );

    v_sum := v_sum + (v_unit * v_qty);
  end loop;

  if v_sum >= 299 and abs(p_shipping_cost) > 0.009 then
    raise exception 'Frete inválido';
  end if;
  if v_sum < 299 and abs(p_shipping_cost - 29) > 0.009 then
    raise exception 'Frete inválido';
  end if;
  if abs((v_sum + p_shipping_cost) - p_total_amount) > 0.009 then
    raise exception 'Total divergente';
  end if;

  return p_id;
end;
$$;

create or replace function public.claim_store_order(
  p_key text,
  p_fingerprint text,
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
  v_fingerprint text;
  v_order_id text;
begin
  if p_key !~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' then
    raise exception 'Tentativa inválida';
  end if;
  if p_fingerprint !~ '^[0-9a-f]{64}$' then
    raise exception 'Tentativa inválida';
  end if;

  insert into public.checkout_attempts (idempotency_key, fingerprint)
  values (p_key, p_fingerprint)
  on conflict (idempotency_key) do nothing;

  select fingerprint, order_id
    into v_fingerprint, v_order_id
    from public.checkout_attempts
    where idempotency_key = p_key
    for update;

  if v_fingerprint is distinct from p_fingerprint then
    raise exception 'Tentativa reutilizada';
  end if;

  if v_order_id is not null then
    return v_order_id;
  end if;

  perform public.create_store_order(
    p_id,
    p_customer_name,
    p_customer_email,
    p_customer_cpf,
    p_customer_phone,
    p_shipping_address,
    p_total_amount,
    p_shipping_cost,
    p_items
  );

  update public.checkout_attempts
    set order_id = p_id
    where idempotency_key = p_key;

  return p_id;
end;
$$;

revoke all on function public.create_store_order(text, text, text, text, text, jsonb, numeric, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.create_store_order(text, text, text, text, text, jsonb, numeric, numeric, jsonb) to service_role;

revoke all on function public.claim_store_order(text, text, text, text, text, text, text, jsonb, numeric, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.claim_store_order(text, text, text, text, text, text, text, jsonb, numeric, numeric, jsonb) to service_role;

create or replace function public.protect_order_amounts()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.total_amount is distinct from old.total_amount
       or new.shipping_cost is distinct from old.shipping_cost then
      raise exception 'Valor do pedido não pode ser alterado';
    end if;
  elsif new.total_amount < 0 or new.shipping_cost < 0 then
    raise exception 'Valor do pedido não pode ser alterado';
  end if;
  return new;
end;
$$;

drop trigger if exists orders_protect_amounts on public.orders;
create trigger orders_protect_amounts
  before insert or update on public.orders
  for each row
  execute function public.protect_order_amounts();

create or replace function public.protect_order_item_price()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.price is distinct from old.price
       or new.quantity is distinct from old.quantity
       or new.product_id is distinct from old.product_id
       or new.order_id is distinct from old.order_id then
      raise exception 'Item do pedido não pode ser alterado';
    end if;
  elsif new.price <= 0 or new.quantity < 1 or new.quantity > 10 then
    raise exception 'Item do pedido não pode ser alterado';
  end if;
  return new;
end;
$$;

drop trigger if exists order_items_protect_price on public.order_items;
create trigger order_items_protect_price
  before insert or update on public.order_items
  for each row
  execute function public.protect_order_item_price();
