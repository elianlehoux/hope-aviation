export default function CertificatesPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="size-24 rounded-[2rem] bg-primary flex items-center justify-center shadow-2xl shadow-primary/20 bg-gradient-to-br from-primary to-primary/80">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-white"
        >
          <path d="M15 12h-5" />
          <path d="M10 16h2" />
          <path d="M12 2v6" />
          <path d="M12 18v4" />
          <path d="m4.93 4.93 4.24 4.24" />
          <path d="m14.83 14.83 4.24 4.24" />
          <path d="m14.83 9.17 4.24-4.24" />
          <path d="m14.83 9.17 0-0" />
          <path d="m4.93 19.07 4.24-4.24" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">
          My Certificates
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          This section is currently under construction. Soon, you will be able to view and download all your earned certificates from completed courses here.
        </p>
      </div>
      
      <div className="inline-flex py-2 px-4 rounded-full bg-accent/10 border border-accent/20">
        <span className="text-xs font-bold text-accent uppercase tracking-widest">Coming Soon</span>
      </div>
    </div>
  );
}
