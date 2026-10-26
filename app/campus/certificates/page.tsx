import { Suspense } from "react";
import { redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getLearnerUser } from "@/lib/campus/learning";
import { getMyCertificates, getMyNameReady } from "@/lib/campus/certificates";
import { CertificateList } from "@/components/features/campus/certificate/CertificateList";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function CertificatesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<CertificatesFallback />}>
      <Certificates searchParams={searchParams} />
    </Suspense>
  );
}

async function Certificates({ searchParams }: { searchParams: SearchParams }) {
  const { user } = await getLearnerUser();
  if (!user) redirect("/auth/login?clear=1");

  const raw = (await searchParams).new;
  const newCourseId = parseUuidParam(Array.isArray(raw) ? raw[0] : raw);
  const [certificates, nameReady] = await Promise.all([getMyCertificates(), getMyNameReady()]);

  return <CertificateList certificates={certificates} newCourseId={newCourseId} nameReady={nameReady} />;
}

function CertificatesFallback() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-16">
      <div className="h-10 w-56 animate-pulse rounded-lg bg-primary/10" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <div className="h-64 animate-pulse rounded-[20px] bg-primary/5" />
        <div className="h-64 animate-pulse rounded-[20px] bg-primary/5" />
      </div>
    </div>
  );
}
