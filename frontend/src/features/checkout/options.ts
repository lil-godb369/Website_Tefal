import type { Choice } from "@/components/ui/form";

// 34 tỉnh, thành từ 1/7/2025 (chính quyền hai cấp: tỉnh và phường/xã, không còn quận/huyện)
export const PROVINCES = [
  "Hà Nội", "TP. Hồ Chí Minh", "Hải Phòng", "Đà Nẵng", "Huế", "Cần Thơ",
  "An Giang", "Bắc Ninh", "Cà Mau", "Cao Bằng", "Đắk Lắk", "Điện Biên", "Đồng Nai", "Đồng Tháp", "Gia Lai",
  "Hà Tĩnh", "Hưng Yên", "Khánh Hòa", "Lai Châu", "Lâm Đồng", "Lạng Sơn", "Lào Cai", "Nghệ An", "Ninh Bình",
  "Phú Thọ", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sơn La", "Tây Ninh", "Thái Nguyên", "Thanh Hóa",
  "Tuyên Quang", "Vĩnh Long",
];

export const DELIVERY = [
  { key: "giao", title: "Giao tận nơi", text: "Phí giao báo khi gọi xác nhận đơn." },
  { key: "showroom", title: "Nhận tại showroom", text: "Xem hàng, nấu thử rồi nhận. Không mất phí giao." },
] as const satisfies readonly Choice[];

export const PAYMENT = [
  { key: "cod", icon: "bag", title: "Trả tiền mặt khi nhận hàng (COD)", text: "Kiểm tra hàng rồi mới trả tiền." },
  { key: "chuyen-khoan", icon: "tag", title: "Chuyển khoản ngân hàng", text: "Số tài khoản gửi kèm khi gọi xác nhận đơn." },
  {
    key: "online",
    icon: "shield",
    title: "Thẻ ATM, Visa, ví điện tử",
    text: "Chưa mở: cần đăng ký cổng thanh toán.",
    disabled: true,
  },
] as const satisfies readonly Choice[];
