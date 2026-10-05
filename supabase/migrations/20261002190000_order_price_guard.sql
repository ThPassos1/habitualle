-- O preço cobrado passa a sair do catálogo, não do JSON enviado ao banco.
-- Frete: grátis a partir de R$ 299; abaixo disso, R$ 29. Igual a lib/format.ts.

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

    select coalesce(promo_price, price)
      into v_unit
      from public.products
      where id = v_product_id
        and published is true
      for update;

    if v_unit is null then
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

revoke all on function public.create_store_order(text, text, text, text, text, jsonb, numeric, numeric, jsonb) from public, anon, authenticated;
grant execute on function public.create_store_order(text, text, text, text, text, jsonb, numeric, numeric, jsonb) to service_role;
