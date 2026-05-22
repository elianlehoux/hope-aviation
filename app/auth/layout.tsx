import { LanguageToggle } from "@/components/shared/language-toggle";

/**
 * Minimal layout for authentication screens with ambient glows and language selection.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-50/50 p-4 md:p-6 overflow-hidden">
      {/* Premium Ambient Background Glows */}
      <div className="absolute -top-[10%] -left-[10%] w-[50vw] h-[50vw] rounded-full bg-accent/6 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[10%] -right-[10%] w-[50vw] h-[50vw] rounded-full bg-primary/4 blur-[120px] pointer-events-none" />

      {/* Floating Language Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <LanguageToggle className="text-slate-500 hover:text-primary hover:bg-white border border-slate-200/50 bg-white/80 backdrop-blur-md shadow-xs size-10 rounded-full flex items-center justify-center transition-all" />
      </div>

      {/* Auth Card Container */}
      <div className="w-full max-w-md rounded-[28px] border border-slate-100/80 bg-white/80 backdrop-blur-xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.06),_0_2px_4px_rgba(0,0,0,0.01)] transition-all duration-300 relative z-10">
        {children}
      </div>
    </div>
  );
}
