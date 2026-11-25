import type { Metadata } from "next";
import { CheckoutView } from "@/features/checkout/checkout-form";

export const metadata: Metadata = { title: "Thanh toán", robots: { index: false } };

export default function CheckoutPage() {
  return <CheckoutView />;
}
