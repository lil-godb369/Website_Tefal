import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/auth-card";

export const metadata: Metadata = { title: "Đăng nhập", robots: { index: false } };

export default function SignInPage() {
  return (
    <Suspense>
      <AuthCard mode="in" />
    </Suspense>
  );
}
