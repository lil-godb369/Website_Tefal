import { offPercent, vnd } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Giá bán, giá gốc gạch ngang, mức giảm; save = thêm dòng "Tiết kiệm …" */
export function PriceTag({
  price,
  original,
  size,
  showOff = true,
  save,
}: {
  price: number;
  original?: number | null;
  size?: "lg";
  showOff?: boolean;
  save?: boolean;
}) {
  const hasWas = typeof original === "number" && original > price;
  const off = hasWas ? offPercent(price, original) : 0;
  return (
    <div className={cn("tf-price", size === "lg" && "tf-price-lg")}>
      <span className="tf-price-now">
        <span className="tf-sr">Giá bán </span>
        {vnd(price)}
      </span>
      {hasWas ? (
        <span className="tf-price-was">
          <span className="tf-sr">Giá gốc </span>
          {vnd(original)}
        </span>
      ) : null}
      {hasWas && off > 0 && showOff ? (
        <span className="tf-price-off">
          <span className="tf-sr">Giảm </span>−{off}%
        </span>
      ) : null}
      {hasWas && save ? <span className="tf-price-save">Tiết kiệm {vnd(original - price)}</span> : null}
    </div>
  );
}
