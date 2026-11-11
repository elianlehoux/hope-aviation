import { AuthShell } from "@/components/features/auth/AuthShell";

/**
 * Shared frame for sign-in, sign-up and password recovery screens.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthShell>{children}</AuthShell>;
}
