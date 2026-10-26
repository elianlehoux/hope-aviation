import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { parseUuidParam } from "@/lib/api/params";
import { getLearnerUser } from "@/lib/campus/learning";
import { getCertificate, getCertificateSiteUrl } from "@/lib/campus/certificates";
import { certificateVerifyUrl } from "@/components/features/campus/certificate/format";
import { bandContours, qrModulesPath } from "@/components/features/campus/certificate/geometry";
import { CertificateView } from "@/components/features/campus/certificate/CertificateView";
import { CertificateNameStep } from "@/components/features/campus/certificate/NameGate";

type Params = Promise<{ enrollmentId: string }>;

export default function CertificatePage({ params }: { params: Params }) {
  return (
    <Suspense fallback={<CertificateFallback />}>
      <Certificate params={params} />
    </Suspense>
  );
}

async function Certificate({ params }: { params: Params }) {
  const enrollmentId = parseUuidParam((await params).enrollmentId);
  if (!enrollmentId) notFound();

  const { user } = await getLearnerUser();
  if (!user) redirect("/auth/login?clear=1");

  const cert = await getCertificate(enrollmentId);
  if (!cert) notFound();

  if (!cert.fullName) {
    return <CertificateNameStep isOwner={cert.isOwner} firstName={cert.firstName} lastName={cert.lastName} />;
  }

  const verifyUrl = certificateVerifyUrl(await getCertificateSiteUrl(), cert.code);

  return (
    <CertificateView
      enrollmentId={cert.enrollmentId}
      fullName={cert.fullName}
      courseTitle={cert.courseTitle}
      completedAt={cert.completedAt}
      code={cert.code}
      verifyUrl={verifyUrl}
      contours={bandContours()}
      qr={qrModulesPath(verifyUrl)}
    />
  );
}

function CertificateFallback() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 pb-16">
      <div className="h-5 w-36 animate-pulse rounded bg-primary/10" />
      <div className="h-10 w-72 animate-pulse rounded-lg bg-primary/10" />
      <div className="aspect-[842/595] w-full animate-pulse rounded bg-primary/10" />
    </div>
  );
}
