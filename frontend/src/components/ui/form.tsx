"use client";

import { forwardRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

/* Ô nhập: nhãn trên, gợi ý và lỗi dưới, lỗi nối bằng aria-describedby.
   Viết theo kiểu forwardRef + ...rest để dùng thẳng với react-hook-form register(). */

interface FieldProps extends Omit<ComponentProps<"input">, "id"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  addon?: ReactNode;
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { id, label, hint, error, optional, addon, type = "text", ...rest },
  ref,
) {
  const errId = id + "-loi";
  const hintId = id + "-goi-y";
  const desc = [hint ? hintId : null, error ? errId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("tf-field", error && "is-invalid")}>
      <label htmlFor={id}>
        {label}
        {optional ? <span className="tf-field-opt"> (không bắt buộc)</span> : null}
      </label>
      <div className="tf-field-control">
        <input
          ref={ref}
          id={id}
          type={type}
          required={!optional}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={desc}
          spellCheck={false}
          {...rest}
        />
        {addon}
      </div>
      {hint ? (
        <p id={hintId} className="tf-field-hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className="tf-field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export const PasswordField = forwardRef<HTMLInputElement, Omit<FieldProps, "type" | "addon">>(
  function PasswordField(props, ref) {
    const [show, setShow] = useState(false);
    return (
      <Field
        ref={ref}
        {...props}
        type={show ? "text" : "password"}
        addon={
          <button
            type="button"
            className="tf-field-eye"
            aria-pressed={show}
            aria-label="Hiện mật khẩu"
            onClick={() => setShow(!show)}
          >
            <Icon name={show ? "eyeOff" : "eye"} size={18} />
          </button>
        }
      />
    );
  },
);

interface SelectProps extends Omit<ComponentProps<"select">, "id"> {
  id: string;
  label: string;
  options: string[];
  placeholder?: string;
  error?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(function SelectField(
  { id, label, options, placeholder = "Chọn", error, ...rest },
  ref,
) {
  const errId = id + "-loi";
  return (
    <div className={cn("tf-field", error && "is-invalid")}>
      <label htmlFor={id}>{label}</label>
      <div className="tf-field-control tf-select">
        <select
          ref={ref}
          id={id}
          required
          aria-invalid={error ? "true" : undefined}
          aria-describedby={error ? errId : undefined}
          {...rest}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p id={errId} className="tf-field-error">
          {error}
        </p>
      ) : null}
    </div>
  );
});

export interface Choice {
  key: string;
  title: string;
  text: string;
  icon?: string;
  disabled?: boolean;
}

/** Nhóm lựa chọn radio vẽ dạng thẻ */
export function ChoiceGroup({
  legend,
  name,
  items,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  items: readonly Choice[];
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <fieldset className="tf-choices">
      <legend>{legend}</legend>
      {items.map((it) => {
        const id = `${name}-${it.key}`;
        return (
          <label
            key={it.key}
            htmlFor={id}
            className={cn("tf-choice", value === it.key && "is-on", it.disabled && "is-off")}
          >
            <input
              type="radio"
              id={id}
              name={name}
              value={it.key}
              checked={value === it.key}
              disabled={it.disabled}
              onChange={() => onChange(it.key)}
            />
            {it.icon ? (
              <span className="tf-choice-icon">
                <Icon name={it.icon} size={20} />
              </span>
            ) : null}
            <span className="tf-choice-text">
              <strong>{it.title}</strong>
              <span>{it.text}</span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

/** Nút "Tiếp tục với Google" theo hướng dẫn nút đăng nhập của Google */
export function GoogleButton({ onClick, children }: { onClick?: () => void; children?: ReactNode }) {
  return (
    <button type="button" className="tf-google" onClick={onClick}>
      <svg width={18} height={18} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <path
          fill="#EA4335"
          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
        />
        <path
          fill="#4285F4"
          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
        />
        <path
          fill="#FBBC05"
          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
        />
        <path
          fill="#34A853"
          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
        />
      </svg>
      {children ?? "Tiếp tục với Google"}
    </button>
  );
}
