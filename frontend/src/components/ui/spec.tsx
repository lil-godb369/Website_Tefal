import { cn } from "@/lib/utils";
import type { Figure } from "@/lib/product";

/** Con số quyết định. chip = dạng chip xám nhạt trên thẻ SP; mặc định = số lớn trên trang chi tiết. */
export function SpecFigure({
  value,
  unit,
  label,
  note,
  chip,
  size,
  className,
}: Figure & { note?: string; chip?: boolean; size?: "sm"; className?: string }) {
  if (chip) {
    return (
      <span className={cn("tf-figchip", className)}>
        <strong>
          {value}
          {unit ? " " + unit : null}
        </strong>
        {label ? <span>{label}</span> : null}
      </span>
    );
  }
  return (
    <div className={cn("tf-figure", size === "sm" && "tf-figure-sm", className)}>
      <span className="tf-figure-value">
        {value}
        {unit ? <span className="tf-figure-unit">{unit}</span> : null}
      </span>
      {label ? <span className="tf-figure-label">{label}</span> : null}
      {note ? <span className="tf-figure-note">{note}</span> : null}
    </div>
  );
}

export function FigureRow({ items }: { items: Figure[] }) {
  if (!items.length) return null;
  return (
    <div className="tf-figure-row">
      {items.map((f, i) => (
        <SpecFigure key={i} {...f} />
      ))}
    </div>
  );
}

export function SpecTable({ rows, caption }: { rows: [string, string][]; caption?: string }) {
  return (
    <table className="tf-spec">
      {caption ? <caption>{caption}</caption> : null}
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}>
            <th scope="row">{r[0]}</th>
            <td>{r[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
