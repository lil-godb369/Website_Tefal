/* Dữ liệu cho video một sản phẩm. Mọi chữ trên video chỉ lấy từ dữ liệu SP (catalog ngày 12/10/2026),
   không thêm lời quảng cáo ngoài dữ liệu (quy tắc trong CLAUDE.md). Đổi SP: thêm một mục như DK061. */

export interface Spec {
  value: string;
  label: string;
}

export interface VideoProduct {
  id: string;
  /** dòng nhỏ phía trên tên: loại SP */
  kind: string;
  /** tên dòng SP, in to */
  line: string;
  model: string;
  /** ảnh SP nền trắng đã cắt sạch, trong public/ */
  image: string;
  /** con số quyết định */
  figure: { value: string; unit: string; label: string; note: string };
  /** 2–3 dòng công nghệ (cảnh nền tối) */
  tech: string[];
  /** cảnh nhấn một điểm nổi bật */
  highlight: { title: string; sub: string };
  specs: Spec[];
  warranty: string;
  /** giá thay đổi theo thời gian: bỏ trống thì không hiện cảnh giá */
  price?: { now: string; was?: string; off?: string; asOf: string };
}

// Nồi cơm điện cao tần Rice Master Max RK819868 (DK-061)
export const DK061: VideoProduct = {
  id: "DK-061",
  kind: "Nồi cơm điện cao tần",
  line: "Rice Master Max",
  model: "RK819868",
  image: "DK-061-noi.png",
  figure: { value: "1,8", unit: "L", label: "Dung tích", note: "Phù hợp gia đình 4–6 thành viên" },
  tech: ["Công nghệ cao tần IH Plus", "Công nghệ 3DMax", "Gia nhiệt trực tiếp lòng nồi"],
  highlight: { title: "Lòng nồi dạng niêu", sub: "Giúp cơm chín đều" },
  specs: [
    { value: "1.400 W", label: "Công suất" },
    { value: "Cảm ứng", label: "Kiểu điều khiển" },
    { value: "Ceramic", label: "Chất liệu" },
    { value: "261 × 336 × 265 mm", label: "Kích thước" },
  ],
  warranty: "24 tháng",
  price: { now: "2.679.000 ₫", was: "3.269.000 ₫", off: "−18%", asOf: "Giá ngày 12/10/2026" },
};

// Nồi chiên không dầu Mega EY8558E0 (DK-069)
export const DK069: VideoProduct = {
  id: "DK-069",
  kind: "Nồi chiên không dầu",
  line: "Mega",
  model: "EY8558E0",
  image: "DK-069-noi.png",
  figure: { value: "7,5", unit: "L", label: "Dung tích", note: "Chế biến khẩu phần lớn trong một lần nấu" },
  tech: ["Dải nhiệt 80–200 °C", "8 chương trình", "Rã đông, lên men, sấy khô, làm bánh"],
  highlight: { title: "Lòng nồi thép không gỉ phủ chống dính", sub: "Dễ vệ sinh sau khi nấu" },
  specs: [
    { value: "2.020 W", label: "Công suất" },
    { value: "Cảm ứng", label: "Kiểu điều khiển" },
    { value: "Inox", label: "Chất liệu" },
    { value: "Pháp", label: "Xuất xứ" },
  ],
  warranty: "36 tháng",
  price: { now: "2.213.000 ₫", was: "2.729.000 ₫", off: "−19%", asOf: "Giá ngày 12/10/2026" },
};

// Máy xay sinh tố làm sữa hạt UltraBlend Silence BL98SC66 (DK-050)
export const DK050: VideoProduct = {
  id: "DK-050",
  kind: "Máy xay làm sữa hạt",
  line: "UltraBlend Silence",
  model: "BL98SC66",
  image: "DK-050-may.png",
  figure: { value: "2.000", unit: "W", label: "Công suất", note: "Dung tích 2 lít, chất liệu thủy tinh" },
  tech: ["Sữa hạt, sinh tố", "Súp, cháo", "Điều khiển cảm ứng"],
  highlight: { title: "Chỉ chạy khi lắp khớp cối", sub: "Tự ngắt khi quá tải" },
  specs: [
    { value: "2.000 W", label: "Công suất" },
    { value: "2 lít", label: "Dung tích" },
    { value: "Thủy tinh", label: "Chất liệu" },
    { value: "573 × 354 × 327 mm", label: "Kích thước" },
  ],
  warranty: "24 tháng",
  price: { now: "5.709.000 ₫", was: "7.259.000 ₫", off: "−21%", asOf: "Giá ngày 12/10/2026" },
};

/** Các SP có video (3 mẫu ở khu trưng bày trang chủ) */
export const PRODUCTS = [DK061, DK069, DK050];
