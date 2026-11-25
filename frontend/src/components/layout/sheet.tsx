"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

/* Lớp phủ toàn màn hình trên điện thoại (menu, tìm kiếm). Esc đóng; phần phía sau bị inert;
   đóng xong trả focus về nút đã mở. initialFocusId: ô nhận focus đầu tiên (mặc định nút Đóng).
   Không dùng autoFocus của React: nó chạy trước effect nên làm sai "nút đã mở". */
export function Sheet({
  label,
  onClose,
  initialFocusId,
  children,
}: {
  label: string;
  onClose: () => void;
  initialFocusId?: string;
  children: ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const first = initialFocusId ? document.getElementById(initialFocusId) : null;
    (first ?? closeRef.current)?.focus();
    function esc(e: KeyboardEvent) {
      if (e.key === "Escape") onCloseRef.current();
    }
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    const behind = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && !el.contains(boxRef.current),
    );
    behind.forEach((el) => (el.inert = true));
    return () => {
      document.removeEventListener("keydown", esc);
      document.body.style.overflow = "";
      behind.forEach((el) => (el.inert = false));
      if (opener && document.contains(opener)) opener.focus();
    };
    // Chỉ chạy khi mở; initialFocusId không đổi trong lúc lớp phủ mở
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Gắn thẳng vào body để mọi thứ khác (cả header) bị inert khi lớp phủ mở
  return createPortal(
    <div
      ref={boxRef}
      className="tf-sheet"
      role="dialog"
      aria-modal="true"
      aria-label={label}
      // Bấm liên kết hoặc gửi ô tìm thì đóng, kể cả khi đường dẫn không đổi (vd /tim-kiem?q=a → ?q=b)
      onClickCapture={(e) => {
        if ((e.target as HTMLElement).closest("a[href]")) onClose();
      }}
      onSubmitCapture={onClose}
    >
      <div className="tf-sheet-head">
        <span className="tf-sheet-title">{label}</span>
        <button ref={closeRef} className="tf-btn tf-btn-quiet" type="button" onClick={onClose}>
          Đóng
        </button>
      </div>
      {children}
    </div>,
    document.body,
  );
}
