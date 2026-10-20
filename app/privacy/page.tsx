"use client";

import Image from "next/image";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Title } from "@/components/ui/title";
import { useTranslation } from "@/lib/i18n/context";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  const { lang } = useTranslation();

  return (
    <main className="relative min-h-screen flex flex-col bg-[#1C1E21] text-white font-sans overflow-hidden">
      <Navbar />
      
      {/* Background Image and Gradient overlays */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/Untitled-1 copy.webp"
          alt="Aviation Background"
          fill
          priority
          className="object-cover object-center opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary via-[#1C1E21] to-ink" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/50 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-32 sm:py-40 relative z-10">
        <div className="w-full max-w-4xl">
          <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-14 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            
            {/* Header Icon & Title */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-2xl text-accent flex items-center justify-center">
                <Shield className="size-8" />
              </div>
              <div>
                <Title level="h1" className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-none">
                  {lang === "es" ? "Política de Privacidad" : "Privacy Policy"}
                </Title>
                <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-2">
                  {lang === "es" ? "Última actualización: Mayo 2026" : "Last updated: May 2026"}
                </p>
              </div>
            </div>

            {/* Content Container */}
            <div className="space-y-8 text-white/80 leading-relaxed font-medium text-[15px] md:text-[16px]">
              {lang === "es" ? (
                // Spanish Version
                <>
                  <p>
                    En <strong>Hope Aviation</strong>, nos tomamos muy en serio la privacidad de tus datos personales. Esta Política de Privacidad describe cómo recopilamos, utilizamos y resguardamos tu información al registrarte y utilizar nuestra plataforma de campus virtual.
                  </p>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      1. Información que Recopilamos
                    </Title>
                    <p>
                      Para brindarte acceso a la plataforma de aprendizaje, recopilamos únicamente los siguientes datos:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-white/70">
                      <li><strong>Información de Registro:</strong> Nombre completo, correo electrónico y contraseña al crear tu cuenta (estudiante o instructor).</li>
                      <li><strong>Progreso Académico:</strong> Cursos en los que te inscribes, avance de lecciones completadas, calificaciones de exámenes y certificados emitidos.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      2. Uso de la Información
                    </Title>
                    <p>
                      Los datos recopilados se utilizan exclusivamente con el fin de:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-white/70">
                      <li>Administrar tu cuenta de usuario y permitirte el ingreso seguro al campus.</li>
                      <li>Registrar tu progreso educativo y calificar evaluaciones académicas.</li>
                      <li>Enviarte comunicaciones importantes sobre el estado del campus o el newsletter (si te has suscrito voluntariamente).</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      3. Cookies y Almacenamiento Local
                    </Title>
                    <p>
                      Nuestra plataforma utiliza únicamente <strong>cookies técnicas y de sesión</strong> provistas por el servicio de base de datos y autenticación (Supabase Auth). Estas cookies son estrictamente necesarias para verificar tu identidad al navegar, mantener tu sesión iniciada de manera segura y proteger el campus de accesos no autorizados.
                    </p>
                    <p className="text-white/70 bg-white/5 border border-white/5 rounded-xl p-4 italic">
                      Nota: No utilizamos cookies de rastreo, píxeles de publicidad de terceros, ni tecnologías de análisis de comportamiento para marketing. Por esta razón, de acuerdo a la legislación vigente, no se requiere un banner de consentimiento de cookies, al ser cookies indispensables para la funcionalidad del servicio.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      4. Compartir Información con Terceros
                    </Title>
                    <p>
                      No vendemos, alquilamos ni compartimos tu información personal con terceros bajo ningún concepto. Tu información se mantiene confidencial dentro del ecosistema de Hope Aviation.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      5. Seguridad de los Datos
                    </Title>
                    <p>
                      Utilizamos la infraestructura en la nube de <strong>Supabase</strong> y <strong>Vercel</strong> para almacenar y transferir tus datos de forma encriptada (HTTPS/SSL). Implementamos medidas de seguridad técnicas para evitar el acceso no autorizado, alteración o pérdida de tus datos.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      6. Derechos sobre tus Datos y Contacto
                    </Title>
                    <p>
                      Tienes derecho a solicitar el acceso, modificación o la eliminación total de tu cuenta y toda la información asociada en nuestras bases de datos. Si deseas ejercer este derecho o tienes alguna duda, puedes contactarte con nuestro equipo en:
                    </p>
                    <p className="mt-2 text-accent font-semibold">
                      <a href="mailto:hope.aviation.uap@gmail.com" className="hover:underline">
                        hope.aviation.uap@gmail.com
                      </a>
                    </p>
                  </section>
                </>
              ) : (
                // English Version
                <>
                  <p>
                    At <strong>Hope Aviation</strong>, we take your personal data privacy very seriously. This Privacy Policy describes how we collect, use, and safeguard your information when you register and interact with our virtual campus platform.
                  </p>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      1. Information We Collect
                    </Title>
                    <p>
                      To provide you with access to the learning platform, we collect only the following data:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-white/70">
                      <li><strong>Registration Details:</strong> Full name, email address, and password when creating your account (student or instructor).</li>
                      <li><strong>Academic Progress:</strong> Enrolled courses, completed lesson progress, exam scores, and certificates issued.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      2. How We Use Information
                    </Title>
                    <p>
                      The collected data is used exclusively to:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-white/70">
                      <li>Manage your user account and allow secure entry to the campus.</li>
                      <li>Record your learning progress and grade academic assessments.</li>
                      <li>Send vital communications about campus updates or the newsletter (if you voluntarily subscribed).</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      3. Cookies and Local Storage
                    </Title>
                    <p>
                      Our platform uses only <strong>technical and session cookies</strong> provided by our database and authentication service (Supabase Auth). These cookies are strictly necessary to verify your identity as you navigate, keep your session securely logged in, and protect the campus from unauthorized access.
                    </p>
                    <p className="text-white/70 bg-white/5 border border-white/5 rounded-xl p-4 italic">
                      Note: We do not use tracking cookies, third-party advertising pixels, or behavior analytics tools for marketing. Therefore, in accordance with active regulations, a cookie consent banner is not required, as these cookies are indispensable to perform the technical service.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      4. Data Sharing with Third Parties
                    </Title>
                    <p>
                      We do not sell, rent, or share your personal information with third parties under any circumstances. Your information remains strictly confidential within the Hope Aviation ecosystem.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      5. Data Security
                    </Title>
                    <p>
                      We use <strong>Supabase</strong> and <strong>Vercel</strong> cloud infrastructure to store and transmit your data in encrypted formats (HTTPS/SSL). We implement technical security measures to prevent unauthorized access, alteration, or loss of your records.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      6. Your Rights and Contact Information
                    </Title>
                    <p>
                      You have the right to request access to, correction of, or the complete deletion of your account and all associated records in our databases. To exercise this right or ask any questions, please contact our team at:
                    </p>
                    <p className="mt-2 text-accent font-semibold">
                      <a href="mailto:hope.aviation.uap@gmail.com" className="hover:underline">
                        hope.aviation.uap@gmail.com
                      </a>
                    </p>
                  </section>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}
