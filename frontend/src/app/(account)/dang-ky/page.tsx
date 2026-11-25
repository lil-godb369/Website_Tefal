import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/features/auth/auth-card";

export const metadata: Metadata = { title: "Đăng ký", robots: { index: false } };

export default function SignUpPage() {
  return (
    <Suspense>
      <AuthCard mode="up" />
    </Suspense>
  );
}
