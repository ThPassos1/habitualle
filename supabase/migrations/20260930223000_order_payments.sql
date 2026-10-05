-- Pagamento Mercado Pago no projeto habitualle.
-- Rode este arquivo no SQL Editor. Pode executar de novo.

alter table public.orders
  add column if not exists payment_id text,
  add column if not exists payment_status text;

create unique index if not exists orders_payment_id_key
  on public.orders (payment_id)
  where payment_id is not null;

create or replace function public.release_pending_order(p_id text, p_payment_status text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  item record;
begin
  if p_id is null or p_id !~ '^HB-[0-9]{6}$' then
    return false;
  end if;

  select status
    into v_status
    from public.orders
    where id = p_id
    for update;

  if v_status is distinct from 'pendente' then
    return false;
  end if;

  for item in
    select product_id, quantity
    from public.order_items
    where order_id = p_id
  loop
    update public.products
      set stock = stock + item.quantity
      where id = item.product_id;
  end loop;

  update public.orders
    set status = 'cancelado',
        payment_status = left(coalesce(nullif(btrim(p_payment_status), ''), 'cancelled'), 40)
    where id = p_id
      and status = 'pendente';

  return true;
end;
$$;

revoke all on function public.release_pending_order(text, text) from public, anon, authenticated;
grant execute on function public.release_pending_order(text, text) to service_role;
