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
                  {lang === "es" ? "Política de privacidad" : "Privacy Policy"}
                </Title>
                <p className="text-slate-400 font-medium text-xs uppercase tracking-widest mt-2">
                  {lang === "es" ? "Última actualización: noviembre de 2026" : "Last updated: November 2026"}
                </p>
              </div>
            </div>

            {/* Content Container */}
            <div className="space-y-8 text-white/80 leading-relaxed font-medium text-[15px] md:text-[16px]">
              {lang === "es" ? (
                // Spanish Version
                <>
                  <p>
                    En <strong>Hope Aviation</strong> nos tomamos en serio la privacidad de tus datos personales. Esta política describe qué información recopilamos, para qué la usamos y cómo la cuidamos cuando te registrás y usás el campus virtual.
                  </p>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      1. Información que recopilamos
                    </Title>
                    <p>
                      Para darte acceso al campus recopilamos únicamente estos datos:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-white/70">
                      <li><strong>Datos de registro:</strong> nombre, correo electrónico y contraseña al crear tu cuenta. Si entrás con Google, recibimos el nombre y el correo de tu cuenta de Google; no vemos tu contraseña de Google.</li>
                      <li><strong>Datos de perfil:</strong> fecha de nacimiento, país y, si querés, teléfono. El nombre de tu perfil es el que aparece en tus certificados.</li>
                      <li><strong>Progreso académico:</strong> cursos en los que te inscribís, clases completadas, resultados de exámenes y certificados emitidos.</li>
                      <li><strong>Newsletter:</strong> si te suscribís, tu correo electrónico.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      2. Uso de la información
                    </Title>
                    <p>
                      Los datos recopilados se utilizan exclusivamente con el fin de:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-white/70">
                      <li>Administrar tu cuenta de usuario y permitirte el ingreso seguro al campus.</li>
                      <li>Registrar tu progreso, corregir los exámenes y emitir tus certificados.</li>
                      <li>Enviarte avisos importantes sobre el campus y, si te suscribiste, el newsletter.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      3. Cookies y almacenamiento local
                    </Title>
                    <p>
                      El sitio usa únicamente <strong>cookies técnicas y de sesión</strong> del servicio de autenticación (Supabase Auth), necesarias para verificar tu identidad, mantener tu sesión iniciada de forma segura y proteger el campus de accesos no autorizados. Además guarda, en una cookie y en el almacenamiento local de tu navegador, el idioma que elegiste.
                    </p>
                    <p className="text-white/70 bg-white/5 border border-white/5 rounded-xl p-4 italic">
                      Nota: No utilizamos cookies de rastreo, píxeles de publicidad de terceros, ni tecnologías de análisis de comportamiento para marketing. Por esta razón, de acuerdo a la legislación vigente, no se requiere un banner de consentimiento de cookies, al ser cookies indispensables para la funcionalidad del servicio.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      4. Compartir información con terceros
                    </Title>
                    <p>
                      No vendemos, alquilamos ni compartimos tu información personal con terceros. La única información visible para otras personas es la de tus certificados: cada uno tiene un código y un link público de verificación que muestra tu nombre, el curso y la fecha, para que quien reciba ese link pueda comprobar que es auténtico. Tu fecha de nacimiento, tu país, tu teléfono y tu correo nunca se muestran ahí.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      5. Seguridad de los datos
                    </Title>
                    <p>
                      Usamos la infraestructura en la nube de <strong>Supabase</strong> y <strong>Vercel</strong> para guardar y transmitir tus datos de forma cifrada (HTTPS). Aplicamos medidas técnicas para evitar el acceso no autorizado, la alteración o la pérdida de tus datos.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      6. Tus derechos y contacto
                    </Title>
                    <p>
                      Tenés derecho a pedir el acceso, la corrección o la eliminación total de tu cuenta y de toda la información asociada. Para ejercerlo, o si tenés alguna duda, escribinos a:
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
                    At <strong>Hope Aviation</strong> we take the privacy of your personal data seriously. This policy describes what information we collect, what we use it for and how we look after it when you register and use the virtual campus.
                  </p>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      1. Information We Collect
                    </Title>
                    <p>
                      To give you access to the campus we collect only this data:
                    </p>
                    <ul className="list-disc list-inside pl-4 space-y-2 text-white/70">
                      <li><strong>Registration details:</strong> name, email address and password when you create your account. If you sign in with Google, we receive the name and email of your Google account; we never see your Google password.</li>
                      <li><strong>Profile details:</strong> date of birth, country and, if you choose, phone number. The name on your profile is the one printed on your certificates.</li>
                      <li><strong>Academic progress:</strong> courses you enroll in, completed lessons, exam results and certificates issued.</li>
                      <li><strong>Newsletter:</strong> your email address, if you subscribe.</li>
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
                      <li>Record your progress, grade exams and issue your certificates.</li>
                      <li>Send you important notices about the campus and, if you subscribed, the newsletter.</li>
                    </ul>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      3. Cookies and Local Storage
                    </Title>
                    <p>
                      The site uses only <strong>technical and session cookies</strong> from the authentication service (Supabase Auth), needed to verify your identity, keep your session securely signed in and protect the campus from unauthorized access. It also stores the language you chose in a cookie and in your browser&apos;s local storage.
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
                      We do not sell, rent or share your personal information with third parties. The only information other people can see is on your certificates: each one has a code and a public verification link that shows your name, the course and the date, so whoever receives that link can check it is genuine. Your date of birth, country, phone number and email are never shown there.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      5. Data Security
                    </Title>
                    <p>
                      We use <strong>Supabase</strong> and <strong>Vercel</strong> cloud infrastructure to store and transmit your data encrypted (HTTPS). We apply technical measures to prevent unauthorized access, alteration or loss of your data.
                    </p>
                  </section>

                  <section className="space-y-3">
                    <Title level="h3" className="text-lg md:text-xl font-bold text-white tracking-tight">
                      6. Your Rights and Contact Information
                    </Title>
                    <p>
                      You have the right to request access to, correction of, or the complete deletion of your account and all associated information. To exercise it, or if you have any questions, write to us at:
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
