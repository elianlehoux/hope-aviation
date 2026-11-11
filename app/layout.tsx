import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n/context";
import { isIndexable, siteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  // Pages set a short title; the template appends the site name.
  title: { default: "Hope Aviation", template: "%s · Hope Aviation" },
  description:
    "Hope Aviation no es una escuela de vuelo. Enseñamos las habilidades que la aviación misionera necesita, y queremos conectar voluntarios con proyectos en el campo.",
  icons: {
    icon: "/icon.png",
  },
  // The share image comes from app/opengraph-image.tsx.
  openGraph: { type: "website", siteName: "Hope Aviation", locale: "es_AR" },
  twitter: { card: "summary_large_image" },
  ...(isIndexable() ? {} : { robots: { index: false, follow: false } }),
};

const display = Bricolage_Grotesque({
  variable: "--font-hope-display",
  display: "swap",
  subsets: ["latin"],
});

const body = Instrument_Sans({
  variable: "--font-hope-body",
  display: "swap",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-hope-mono",
  weight: ["400", "500"],
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${display.variable} ${body.variable} ${plexMono.variable} ${body.className} antialiased`}>
        <TooltipProvider>
          <LanguageProvider>
            {children}
            <Toaster position="top-right" />
          </LanguageProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
