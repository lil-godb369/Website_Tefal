-- Giữ hàng ngay khi đặt đơn (người dùng chốt 23/10/2026).
-- - products.stock_qty: số lượng còn bán. NULL = chưa theo dõi số lượng, chỉ dùng cờ in_stock như trước.
--   Điền từ inventoryQty khi chép dữ liệu từ nguồn sang project Supabase riêng.
-- - place_order khóa dòng SP, kiểm đủ hàng rồi trừ kho trong cùng một giao dịch:
--   2 người cùng đặt chiếc cuối thì người sau phải chờ người trước, rồi bị báo hết hàng.
--   Thiếu bất kỳ món nào thì cả đơn không tạo (lỗi P0409, chi tiết là danh sách món thiếu).
-- - Đơn chuyển sang "đã hủy" thì hoàn kho; không cho mở lại đơn đã hủy.
-- Chưa chạy trên Supabase thật (23/10/2026). Kiểm thử đồng thời: supabase/tests/giu_hang.sql.

-- ---------- tồn kho ----------
alter table public.products
  add column stock_qty int check (stock_qty is null or stock_qty >= 0);
comment on column public.products.stock_qty is
  'Số lượng còn bán. NULL = chưa theo dõi số lượng (chỉ dùng cờ in_stock).';

-- Có số lượng thì cờ in_stock đi theo số lượng (web đọc in_stock để tắt nút mua)
create function public.sync_in_stock() returns trigger
language plpgsql set search_path = '' as $$
begin
  if new.stock_qty is not null then
    new.in_stock := new.stock_qty > 0;
  end if;
  return new;
end $$;
create trigger products_sync_in_stock
  before insert or update of stock_qty on public.products
  for each row execute function public.sync_in_stock();

-- ---------- đặt hàng: kiểm và trừ kho cùng giao dịch ----------
create or replace function public.place_order(
  p_items jsonb,            -- [{"id":"DK-042","qty":1}, …]
  p_name text,
  p_phone text,
  p_delivery text,
  p_address jsonb,
  p_payment text,
  p_note text,
  p_save_address boolean default false
) returns jsonb             -- {"id": "TF…", "subtotal": 1234000, "items": ["DK-042", …]}
language plpgsql security definer set search_path = '' as $$
declare
  v_user uuid := auth.uid();
  v_id   text := 'TF' || to_char(now() at time zone 'Asia/Ho_Chi_Minh', 'YYMMDD') || '-'
                 || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  v_req   jsonb;            -- [{"id","qty"}] đã gộp mã trùng
  v_short jsonb;            -- [{"id","ten","con","dat"}] món không đủ hàng
  v_total bigint;
begin
  if v_user is null then raise exception 'chua dang nhap' using errcode = '28000'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'gio hang khong hop le' using errcode = '22023';
  end if;
  -- Chặn gửi đơn dồn dập: tối đa 5 đơn chờ xác nhận trong 30 phút
  if (select count(*) from public.orders
      where user_id = v_user and status = 'cho-xac-nhan' and created_at > now() - interval '30 minutes') >= 5 then
    raise exception 'qua nhieu don' using errcode = 'P0429';
  end if;

  select jsonb_agg(jsonb_build_object('id', id, 'qty', qty))
  into v_req
  from (
    select i ->> 'id' as id, least(greatest(sum((i ->> 'qty')::int), 1), 99) as qty
    from jsonb_array_elements(p_items) i
    group by 1
  ) g;

  -- Khóa các dòng SP liên quan, theo thứ tự mã (tránh khóa chéo giữa 2 đơn cùng lúc).
  -- Đơn thứ hai đặt cùng SP phải chờ đơn thứ nhất xong rồi mới đọc số lượng.
  perform 1 from public.products p
  where p.id in (select r.id from jsonb_to_recordset(v_req) as r(id text, qty int))
  order by p.id
  for update;

  -- Món không đủ: không còn bán, hết hàng, hoặc số lượng còn ít hơn số đặt
  select jsonb_agg(jsonb_build_object('id', r.id, 'ten', p.name, 'con', coalesce(p.stock_qty, 0), 'dat', r.qty))
  into v_short
  from jsonb_to_recordset(v_req) as r(id text, qty int)
  left join public.products p on p.id = r.id
  where p.id is null or not p.in_stock or (p.stock_qty is not null and p.stock_qty < r.qty);
  if v_short is not null then
    raise exception 'khong du hang' using errcode = 'P0409', detail = v_short::text;
  end if;

  insert into public.orders (id, user_id, name, phone, delivery, address, payment, note, subtotal)
  values (v_id, v_user, trim(p_name), p_phone, p_delivery,
          case when p_delivery = 'giao' then p_address end, p_payment, coalesce(trim(p_note), ''), 0);

  insert into public.order_items (order_id, product_id, name, model, unit_price, qty)
  select v_id, p.id, p.name, p.model, p.price, r.qty
  from jsonb_to_recordset(v_req) as r(id text, qty int)
  join public.products p on p.id = r.id;

  -- Trừ kho (SP chưa theo dõi số lượng thì bỏ qua)
  update public.products p
  set stock_qty = p.stock_qty - r.qty
  from jsonb_to_recordset(v_req) as r(id text, qty int)
  where p.id = r.id and p.stock_qty is not null;

  select coalesce(sum(unit_price * qty), 0) into v_total from public.order_items where order_id = v_id;
  update public.orders set subtotal = v_total where id = v_id;

  if p_save_address and p_delivery = 'giao' then
    update public.profiles set address = p_address, phone = coalesce(phone, p_phone) where id = v_user;
  end if;
  return jsonb_build_object('id', v_id, 'subtotal', v_total,
    'items', (select jsonb_agg(product_id) from public.order_items where order_id = v_id));
end $$;

revoke all on function public.place_order(jsonb, text, text, text, jsonb, text, text, boolean) from public, anon;
grant execute on function public.place_order(jsonb, text, text, text, jsonb, text, text, boolean) to authenticated;

-- ---------- hủy đơn thì hoàn kho ----------
create function public.restock_on_cancel() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'da-huy' and old.status <> 'da-huy' then
    update public.products p
    set stock_qty = p.stock_qty + i.qty
    from public.order_items i
    where i.order_id = new.id and p.id = i.product_id and p.stock_qty is not null;
  elsif old.status = 'da-huy' and new.status <> 'da-huy' then
    -- Mở lại đơn đã hủy sẽ phải trừ kho lại mà không kiểm đủ hàng: không cho, tạo đơn mới thay thế
    raise exception 'khong mo lai don da huy' using errcode = 'P0001';
  end if;
  return new;
end $$;
create trigger orders_restock_on_cancel
  after update of status on public.orders
  for each row execute function public.restock_on_cancel();
