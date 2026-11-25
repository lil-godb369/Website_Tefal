import { describe, expect, it } from "vitest";
import { parseShortages, shortageMessage } from "@/features/checkout/stock";

describe("báo không đủ hàng (P0409)", () => {
  const details = JSON.stringify([
    { id: "DK-061", ten: "Nồi cơm điện Rice Master", con: 1, dat: 2 },
    { id: "NC-060", ten: "Chảo Ingenio", con: 0, dat: 1 },
  ]);

  it("đọc danh sách món thiếu", () => {
    expect(parseShortages(details)).toEqual([
      { id: "DK-061", ten: "Nồi cơm điện Rice Master", con: 1, dat: 2 },
      { id: "NC-060", ten: "Chảo Ingenio", con: 0, dat: 1 },
    ]);
  });

  it("chi tiết sai định dạng thì không vỡ", () => {
    expect(parseShortages("không phải json")).toEqual([]);
    expect(parseShortages(undefined)).toEqual([]);
    expect(parseShortages(JSON.stringify({ id: "x" }))).toEqual([]);
  });

  it("câu báo nói rõ còn bao nhiêu, món nào hết", () => {
    const msg = shortageMessage(parseShortages(details));
    expect(msg).toContain("Nồi cơm điện Rice Master: chỉ còn 1, bạn đặt 2.");
    expect(msg).toContain("Chảo Ingenio: đã hết hàng.");
    expect(msg).toContain("đơn chưa được tạo");
    expect(msg).not.toContain("!");
  });

  it("mã không còn trong DB thì nêu mã", () => {
    expect(shortageMessage([{ id: "ZZ-1", ten: null, con: 0, dat: 1 }])).toContain("Mã ZZ-1: đã hết hàng.");
  });
});
