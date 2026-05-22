"use client";

import Image from "next/image";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
import { Title } from "@/components/ui/title";
import { useTranslation } from "@/lib/i18n/context";
import { FileText, AlertTriangle } from "lucide-react";

export default function TermsPage() {
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
        <div className="absolute inset-0 bg-gradient-to-b from-[#00263E] via-[#1C1E21] to-[#0B0F15]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#00263E]/50 to-transparent" />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 py-32 sm:py-40 relative z-10">
        <div className="w-full max-w-4xl">
          <div className="bg-white/5 backdrop-blur-xl rounded-[32px] p-8 md:p-14 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            
            {/* Header Icon & Title */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-2xl text-accent flex items-center justify-center">
                <FileText className="size-8" />
              </div>
              <div>
                <Title level="h1" className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-none">
                  {lang === "es" ? "Términos de Servicio" : "Terms of Service"}
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
                    Bienvenido a <strong>Hope Aviation</strong>. Al acceder a nuestro campus virtual y sitio web, aceptas estar sujeto a estos Términos de Servicio. Por favor, léelos atentamente antes de utilizar la plataforma.
                  </p>

                  {/* Operational Disclaimer - CRITICAL */}
                  <section className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-3 text-amber-500">
                      <AlertTriangle className="size-6 shrink-0" />
                      <Title level="h3" className="text-lg md:text-xl font-bold tracking-tight text-white m-0">
                        1. AVISO DE SIMULACIÓN Y DESLINDE DE RESPONSABILIDAD AÉREA
                      </Title>
                    </div>
                    <div className="space-y-3 text-white/90 text-sm md:text-base leading-relaxed">
                      <p>
                        <strong>IMPORTANTE:</strong> Todo el contenido educativo, manuales de vuelo, planes de estudio, preguntas de exámenes, guías y recursos didácticos provistos en este campus virtual están diseñados exclusivamente para <strong>fines educativos, de simulación de vuelo virtual y entretenimiento</strong>.
                      </p>
                      <p>
                        Ningún material provisto en esta plataforma constituye instrucción de vuelo real oficial, aprobada o certificada por ninguna autoridad de aviación civil (como la ANAC, FAA, EASA u otras).
                      </p>
                      <p className="font-semibold text-white">
                        Hope Aviation y sus desarrolladores se deslindan por completo de toda responsabilidad civil, comercial o penal por cualquier incidente, accidente, daños materiales, lesiones físicas o muerte derivados del intento de aplicar las técnicas, procedimientos, listas de chequeo o conocimientos de este campus en operaciones aéreas de aeronaves reales en el mundo real.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      2. Registro y Seguridad de Cuentas
                    </Title>
                    <p>
                      Para acceder a ciertos cursos y secciones del campus, es necesario crear una cuenta de usuario. Eres el único responsable de mantener la confidencialidad de tus credenciales de inicio de sesión. Te comprometes a:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-white/70">
                      <li>Proporcionar información de registro verídica y actualizada.</li>
                      <li>No compartir las credenciales de tu cuenta con terceros.</li>
                      <li>Notificarnos de inmediato cualquier uso no autorizado de tu cuenta.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      3. Propiedad Intelectual
                    </Title>
                    <p>
                      Todo el material interactivo, videos, textos, imágenes, logos, marcas y código de software en Hope Aviation son propiedad intelectual de la plataforma o de sus respectivos creadores. Se prohíbe la copia, reproducción, distribución, venta o alteración del contenido sin nuestra autorización expresa y por escrito.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      4. Uso Permitido del Campus
                    </Title>
                    <p>
                      El uso de la plataforma está restringido a actividades académicas de aprendizaje. No está permitido:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-white/70">
                      <li>Utilizar sistemas automatizados (bots, scrapers) para extraer datos de la plataforma.</li>
                      <li>Intentar vulnerar, burlar o deshabilitar cualquier medida de seguridad de la red o del servidor.</li>
                      <li>Publicar contenido difamatorio, de odio, abusivo o ilegal en los foros comunitarios del campus.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      5. Limitación de Responsabilidad General
                    </Title>
                    <p>
                      Hope Aviation proporciona el sitio web y el campus virtual &quot;tal como están&quot;, sin garantías de ningún tipo respecto a su disponibilidad ininterrumpida, velocidad o preservación de datos académicos en caso de fallas técnicas ajenas a nuestro control razonable.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      6. Modificaciones de los Términos
                    </Title>
                    <p>
                      Nos reservamos el derecho de actualizar estos Términos de Servicio cuando sea necesario. Tu uso continuado de la plataforma tras la publicación de los cambios constituye tu aceptación vinculante de los nuevos términos.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      7. Contacto
                    </Title>
                    <p>
                      Si tienes dudas o consultas sobre estos Términos de Servicio, ponte en contacto con nosotros en:
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
                    Welcome to <strong>Hope Aviation</strong>. By accessing our virtual campus and website, you agree to be bound by these Terms of Service. Please read them carefully before using the platform.
                  </p>

                  {/* Operational Disclaimer - CRITICAL */}
                  <section className="bg-amber-500/10 border border-amber-500/25 rounded-2xl p-6 md:p-8 space-y-4">
                    <div className="flex items-center gap-3 text-amber-500">
                      <AlertTriangle className="size-6 shrink-0" />
                      <Title level="h3" className="text-lg md:text-xl font-bold tracking-tight text-white m-0">
                        1. FLIGHT SIMULATION NOTICE & AVIATION LIABILITY DISCLAIMER
                      </Title>
                    </div>
                    <div className="space-y-3 text-white/90 text-sm md:text-base leading-relaxed">
                      <p>
                        <strong>IMPORTANT:</strong> All educational content, flight manuals, lesson plans, quiz questions, guides, and study materials provided on this virtual campus are designed exclusively for <strong>educational, virtual flight simulation, and entertainment purposes</strong>.
                      </p>
                      <p>
                        None of the content on this platform constitutes official flight instruction and does not replace certified training at an authorized aviation school or academy under any civil aviation authorities (such as FAA, EASA, or others).
                      </p>
                      <p className="font-semibold text-white">
                        Hope Aviation and its developers completely disclaim any and all civil, commercial, or criminal liability for any incident, accident, property damage, physical injury, or death resulting from the attempt to apply techniques, procedures, checklists, or knowledge obtained from this campus in real-world aircraft operations.
                      </p>
                    </div>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      2. Account Registration and Security
                    </Title>
                    <p>
                      To access certain courses and sections of the campus, you must create a user account. You are solely responsible for maintaining the confidentiality of your login credentials. You agree to:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-white/70">
                      <li>Provide true, accurate, and current registration information.</li>
                      <li>Never share your account credentials with third parties.</li>
                      <li>Notify us immediately of any unauthorized use of your account.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      3. Intellectual Property
                    </Title>
                    <p>
                      All interactive study materials, videos, texts, images, logos, trademarks, and software code on Hope Aviation are the intellectual property of the platform or their respective authors. Copying, reproducing, distributing, selling, or altering the content is prohibited without our prior written consent.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      4. Permitted Use of the Campus
                    </Title>
                    <p>
                      The use of this platform is strictly restricted to academic learning. You agree not to:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-white/70">
                      <li>Use automated systems (bots, scrapers) to extract data from the platform.</li>
                      <li>Attempt to compromise, bypass, or disable any server or network security measures.</li>
                      <li>Publish defamatory, hateful, abusive, or unlawful content in campus community forums.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      5. General Limitation of Liability
                    </Title>
                    <p>
                      Hope Aviation provides this website and virtual campus &quot;as is&quot; without warranties of any kind regarding uninterrupted service, speed, or permanent preservation of academic progress data in the event of technical failures outside our reasonable control.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      6. Changes to the Terms
                    </Title>
                    <p>
                      We reserve the right to update these Terms of Service as necessary. Your continued use of the platform after updates are posted constitutes your binding acceptance of the new terms.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      7. Contact Information
                    </Title>
                    <p>
                      If you have any questions or concerns regarding these Terms of Service, please contact our team at:
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
