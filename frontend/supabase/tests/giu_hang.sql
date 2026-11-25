-- Kiểm thử giữ hàng (migration 20261023000000_giu_hang.sql). Chạy trên Supabase chạy ở máy (supabase start),
-- KHÔNG chạy trên project thật. Cần sẵn 2 user trong auth.users (đăng ký 2 tài khoản thử trên web ở máy).
--
-- A. Hai người cùng mua chiếc cuối (mở 2 cửa sổ psql, chạy song song):
--    Chuẩn bị (một lần):
--      update public.products set stock_qty = 1 where id = 'DK-061';
--    Cửa sổ 1:                                    Cửa sổ 2:
--      begin;                                       begin;
--      set local role authenticated;               set local role authenticated;
--      set local request.jwt.claim.sub = '<user1>'; set local request.jwt.claim.sub = '<user2>';
--      select public.place_order('[{"id":"DK-061","qty":1}]', 'An', '0901234567', 'showroom', null, 'cod', '');
--                                                   select public.place_order(... như trên ...);
--                                                   -- ĐỨNG CHỜ: dòng DK-061 đang bị cửa sổ 1 khóa
--      commit;
--                                                   -- Báo lỗi P0409 'khong du hang',
--                                                   -- DETAIL: [{"id": "DK-061", "con": 0, "dat": 1, …}]
--                                                   rollback;
--    Kết quả đúng: chỉ 1 đơn, stock_qty = 0, in_stock = false.

-- B. Kiểm nhanh trong một phiên (các bước tuần tự):
begin;
update public.products set stock_qty = 2 where id = 'DK-061';
select stock_qty, in_stock from public.products where id = 'DK-061';            -- 2, true

-- đặt 3 cái: thiếu hàng, không tạo đơn, kho giữ nguyên
-- (cần đặt request.jwt.claim.sub = một user thật trước khi gọi)
-- select public.place_order('[{"id":"DK-061","qty":3}]', 'An', '0901234567', 'showroom', null, 'cod', '');
-- => P0409; select stock_qty from public.products where id = 'DK-061';  -- vẫn 2

-- đặt 2 cái: thành công, kho về 0, in_stock tự thành false
-- select public.place_order('[{"id":"DK-061","qty":2}]', 'An', '0901234567', 'showroom', null, 'cod', '');
-- select stock_qty, in_stock from public.products where id = 'DK-061';            -- 0, false

-- hủy đơn vừa đặt: hoàn kho
-- update public.orders set status = 'da-huy' where id = '<mã đơn>';
-- select stock_qty, in_stock from public.products where id = 'DK-061';            -- 2, true

-- mở lại đơn đã hủy: bị chặn
-- update public.orders set status = 'cho-xac-nhan' where id = '<mã đơn>';       -- lỗi 'khong mo lai don da huy'
rollback;
