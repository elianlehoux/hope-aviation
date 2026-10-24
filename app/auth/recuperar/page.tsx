import type { Metadata } from "next";
import { RecoverForm } from "@/components/features/auth/RecoverForm";

export const metadata: Metadata = { title: "Recuperar clave · Hope Aviation" };

export default function RecoverPage() {
  return <RecoverForm />;
}
