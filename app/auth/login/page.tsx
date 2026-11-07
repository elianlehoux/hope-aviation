import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/features/auth/LoginForm";
import { AuthFormSkeleton } from "@/components/features/auth/auth-ui";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  // LoginForm reads search params (`next`, `error`), so it needs Suspense.
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
