import type { Metadata } from "next";
import { Suspense } from "react";
import { SignupForm } from "@/components/features/auth/SignupForm";
import { AuthFormSkeleton } from "@/components/features/auth/auth-ui";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function SignupPage() {
  // SignupForm reads `next` from search params, so it needs Suspense.
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <SignupForm />
    </Suspense>
  );
}
