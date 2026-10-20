import type { Metadata } from "next";
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/lib/i18n/context";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Hope Aviation",
  description:
    "Hope Aviation no es una escuela de vuelo. Enseñamos las habilidades que la aviación misionera necesita, y conectamos voluntarios con proyectos en el campo.",
  icons: {
    icon: "/icon.png",
  },
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
