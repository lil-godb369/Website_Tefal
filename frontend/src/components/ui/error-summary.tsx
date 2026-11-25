"use client";

/* Tóm tắt lỗi đầu form (từ 2 lỗi trở lên): người dùng trình đọc màn hình biết hết các chỗ cần sửa,
   bấm từng dòng để tới ô đó. Một lỗi thì focus thẳng vào ô lỗi (focusFirstError). */

export function ErrorSummary({
  id,
  errors,
  ids,
}: {
  id: string;
  /** tên trường → lời báo lỗi, theo thứ tự ô trên form */
  errors: [string, string | undefined][];
  ids: Record<string, string>;
}) {
  const list = errors.filter((e): e is [string, string] => !!e[1]);
  if (list.length < 2) return null;
  return (
    <div className="tf-errsum" tabIndex={-1} role="group" aria-labelledby={id + "-tieu-de"} id={id}>
      <p id={id + "-tieu-de"} className="tf-errsum-title">
        Còn {list.length} chỗ cần sửa
      </p>
      <ul>
        {list.map(([k, msg]) => (
          <li key={k}>
            <a
              href={"#" + ids[k]}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(ids[k])?.focus();
              }}
            >
              {msg}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Sau khi gửi form lỗi: 2 lỗi trở lên thì focus bảng tóm tắt, 1 lỗi thì focus ô lỗi.
 *  Nhận form hoặc sự kiện submit (react-hook-form truyền sự kiện vào hàm báo lỗi). */
export function focusErrors(target: HTMLFormElement | { target: unknown } | null | undefined, count: number) {
  const form = target instanceof HTMLFormElement ? target : target && target.target instanceof HTMLFormElement ? target.target : null;
  setTimeout(() => {
    const el =
      count >= 2 ? form?.querySelector<HTMLElement>(".tf-errsum") : form?.querySelector<HTMLElement>('[aria-invalid="true"]');
    el?.focus();
  }, 0);
}
