# Video giới thiệu sản phẩm (Remotion)

Dựng video ngắn cho từng SP từ ảnh và thông số. Kiểu chữ theo video quảng cáo của Tefal: chữ in hoa đậm, góc vuông đỏ ở hai đầu khối chữ, con số lớn. Font Be Vietnam Pro giống web.

## Chạy

```bash
npm install
npm run studio     # xem và chỉnh trong trình duyệt
npm run render     # xuất out/san-pham.mp4
```

Lần đầu Remotion tải Chrome Headless Shell (khoảng 100 MB).

## Cấu trúc

- `src/data.ts`: dữ liệu từng SP. Thêm SP mới bằng cách thêm một mục như `DK061` rồi đổi `defaultProps` trong `src/Root.tsx`.
- `src/scenes.tsx`: 7 cảnh. Mở đầu, con số quyết định, công nghệ (nền tối), điểm nổi bật, thông số, bảo hành và giá, cảnh kết.
- `src/ui.tsx`: khối chữ góc đỏ (`Bracket`), hiệu ứng hiện dần, ảnh SP hòa nền (`ProductShot`).
- `public/`: ảnh SP đã cắt sạch, ảnh bếp.

## Quy tắc

- Chữ trên video chỉ lấy từ dữ liệu SP (catalog). Không thêm lời quảng cáo, chứng nhận hay lợi ích ngoài dữ liệu.
- Giá thay đổi theo thời gian, nên luôn ghi ngày của giá. Bỏ `price` thì video không có cảnh giá, dùng được lâu hơn.
- Ảnh SP phải là ảnh sạch, không logo cửa hàng khác. Ảnh hiện tại (`DK-061-noi.png`) cắt từ ảnh cũ có logo cửa hàng khác, chỉ dùng cho bản thử, **chưa đưa lên web**.
- Cảnh kết đang dùng chữ "Tefal" màu đỏ thay cho logo. Có file logo chính thức thì thay vào.
- Animation phải dựa trên `useCurrentFrame()`; không dùng CSS transition hay animation (skill `remotion-video-creation`).
