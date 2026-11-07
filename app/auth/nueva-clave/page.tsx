import type { Metadata } from "next";
import { Suspense } from "react";
import { NewPasswordForm } from "@/components/features/auth/NewPasswordForm";
import { AuthFormSkeleton } from "@/components/features/auth/auth-ui";

export const metadata: Metadata = { title: "Nueva clave" };

export default function NewPasswordPage() {
  // NewPasswordForm reads `expired` from search params, so it needs Suspense.
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <NewPasswordForm />
    </Suspense>
  );
}
