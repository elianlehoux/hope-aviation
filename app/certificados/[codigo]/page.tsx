import { Suspense } from "react";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { TranslatedText } from "@/types/database";
import { VerificationCard, type VerifiedCertificate } from "@/components/features/campus/certificate/VerificationCard";

export const metadata: Metadata = {
  title: "Verificación de certificado · Hope Aviation",
  robots: { index: false, follow: false },
};

type Params = Promise<{ codigo: string }>;

/** Public certificate verification (no login). The RPC returns only name, course and date. */
export default function CertificateVerificationPage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<main className="min-h-dvh bg-paper" />}>
      <Verification params={params} />
    </Suspense>
  );
}

async function Verification({ params }: { params: Params }) {
  let code = "";
  try {
    code = decodeURIComponent((await params).codigo).trim().toUpperCase().slice(0, 64);
  } catch {
    code = "";
  }

  let certificate: VerifiedCertificate | null = null;
  if (/^[A-Z0-9-]{4,64}$/.test(code)) {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("verify_certificate", { p_code: code });
    if (error) console.error("verify_certificate", error.message);
    const row = (Array.isArray(data) ? data[0] : data) as
      | { full_name: string | null; course_title: TranslatedText; completed_at: string }
      | null
      | undefined;
    if (row) {
      certificate = {
        fullName: row.full_name?.trim() || "—",
        courseTitle: row.course_title,
        completedAt: row.completed_at,
      };
    }
  }

  return <VerificationCard code={code} certificate={certificate} />;
}
