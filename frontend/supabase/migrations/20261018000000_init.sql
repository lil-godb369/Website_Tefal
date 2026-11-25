-- Tefal Web: bảng ban đầu. Chạy trên project Supabase RIÊNG của Tefal Web.
-- Chưa chạy thử trên Supabase thật (18/10/2026): kiểm tra lại bằng `supabase db reset` trên máy trước khi đưa lên.

-- ---------- danh mục và sản phẩm: ai cũng đọc được, chỉ quản trị ghi ----------
create table public.product_groups (
  key        text primary key,
  name       text not null,
  art        text not null default 'pan',
  sort       int  not null default 0
);

create table public.products (
  id              text primary key check (id ~ '^[A-Z]+-[0-9]+$'),
  group_key       text not null references public.product_groups (key),
  name            text not null,
  full_name       text not null,
  model           text not null,
  price           bigint not null default 0 check (price >= 0),  -- 0 = chưa có giá, gọi báo giá
  orig_price      bigint check (orig_price is null or orig_price >= 0),
  pct             int not null default 0,
  origin          text,
  warranty_months int,
  in_stock        boolean not null default true,
  image_url       text not null default '',
  key_figure      jsonb,                                          -- {"v":"5","u":"L","l":"Dung tích"}
  power           text,
  capacity        text,
  specs           jsonb not null default '[]'::jsonb,             -- [["Công suất","2.200 W"], …]
  description     text not null default '',
  points          jsonb not null default '[]'::jsonb,
  updated_at      timestamptz not null default now()
);
create index products_group_key_idx on public.products (group_key);

alter table public.product_groups enable row level security;
alter table public.products enable row level security;
create policy "ai cũng xem được nhóm" on public.product_groups for select to anon, authenticated using (true);
create policy "ai cũng xem được SP" on public.products for select to anon, authenticated using (true);

-- ---------- hồ sơ khách: mỗi người chỉ thấy và sửa hồ sơ của mình ----------
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text,
  phone      text,
  address    jsonb,                                               -- {"province","ward","street"}
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "xem hồ sơ của mình" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "sửa hồ sơ của mình" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Tạo hồ sơ khi có tài khoản mới (lấy họ tên, SĐT từ lúc đăng ký)
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'phone');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- đơn hàng: khách chỉ đọc đơn của mình; ghi đơn chỉ qua hàm place_order ----------
create table public.orders (
  id         text primary key,
  user_id    uuid not null references auth.users (id),
  status     text not null default 'cho-xac-nhan'
             check (status in ('cho-xac-nhan', 'da-xac-nhan', 'dang-giao', 'da-giao', 'da-huy')),
  name       text not null check (char_length(name) between 2 and 100),
  phone      text not null check (phone ~ '^(0|\+84)[0-9]{9}$'),
  delivery   text not null check (delivery in ('giao', 'showroom')),
  -- giao tận nơi: đúng 3 khóa chuỗi; nhận tại showroom: null
  address    jsonb check (
               address is null or (
                 jsonb_typeof(address) = 'object'
                 and (address - 'province' - 'ward' - 'street') = '{}'::jsonb
                 and char_length(address ->> 'province') between 2 and 60
                 and char_length(address ->> 'ward') between 2 and 100
                 and char_length(address ->> 'street') between 3 and 200)),
  payment    text not null check (payment in ('cod', 'chuyen-khoan')),
  note       text not null default '' check (char_length(note) <= 500),
  subtotal   bigint not null,
  created_at timestamptz not null default now(),
  check ((delivery = 'giao') = (address is not null))
);
create index orders_user_id_idx on public.orders (user_id, created_at desc);

create table public.order_items (
  order_id   text not null references public.orders (id) on delete cascade,
  product_id text not null references public.products (id),
  name       text not null,
  model      text not null,
  unit_price bigint not null,                                    -- giá tại lúc đặt (0 = báo giá sau)
  qty        int not null check (qty between 1 and 99),
  primary key (order_id, product_id)
);
create index order_items_product_id_idx on public.order_items (product_id);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create policy "xem đơn của mình" on public.orders for select to authenticated using ((select auth.uid()) = user_id);
create policy "xem dòng đơn của mình" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and o.user_id = (select auth.uid())));
-- Không có policy insert/update: trình duyệt không tự ghi đơn hay sửa giá được.

-- Đặt hàng: giá lấy từ bảng products, không lấy từ trình duyệt. Hàm này gọi được thẳng bằng khóa công khai,
-- nên mọi kiểm tra phải nằm ở đây và trong CHECK của bảng, không chỉ ở Server Action.
create function public.place_order(
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
  v_total bigint;
  v_lines int;
begin
  if v_user is null then raise exception 'chua dang nhap' using errcode = '28000'; end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 50 then
    raise exception 'gio hang khong hop le' using errcode = '22023';
  end if;
  -- Chặn gửi đơn dồn dập (đơn COD giả mang tên, SĐT người khác): tối đa 5 đơn chờ xác nhận trong 30 phút
  if (select count(*) from public.orders
      where user_id = v_user and status = 'cho-xac-nhan' and created_at > now() - interval '30 minutes') >= 5 then
    raise exception 'qua nhieu don' using errcode = 'P0429';
  end if;

  insert into public.orders (id, user_id, name, phone, delivery, address, payment, note, subtotal)
  values (v_id, v_user, trim(p_name), p_phone, p_delivery,
          case when p_delivery = 'giao' then p_address end, p_payment, coalesce(trim(p_note), ''), 0);

  -- Chỉ nhận SP còn hàng; trùng mã thì gộp số lượng
  insert into public.order_items (order_id, product_id, name, model, unit_price, qty)
  select v_id, p.id, p.name, p.model, p.price, least(greatest(sum((i ->> 'qty')::int), 1), 99)
  from jsonb_array_elements(p_items) i
  join public.products p on p.id = i ->> 'id' and p.in_stock
  group by p.id, p.name, p.model, p.price;

  select count(*), coalesce(sum(unit_price * qty), 0) into v_lines, v_total
  from public.order_items where order_id = v_id;
  if v_lines = 0 then raise exception 'khong co san pham hop le' using errcode = 'P0410'; end if;
  update public.orders set subtotal = v_total where id = v_id;

  if p_save_address and p_delivery = 'giao' then
    update public.profiles set address = p_address, phone = coalesce(phone, p_phone) where id = v_user;
  end if;
  -- items: mã SP đã nhận vào đơn (bỏ món hết hàng), để web chỉ xóa những món này khỏi giỏ
  return jsonb_build_object('id', v_id, 'subtotal', v_total,
    'items', (select jsonb_agg(product_id) from public.order_items where order_id = v_id));
end $$;

revoke all on function public.place_order(jsonb, text, text, text, jsonb, text, text, boolean) from public, anon;
grant execute on function public.place_order(jsonb, text, text, text, jsonb, text, text, boolean) to authenticated;
