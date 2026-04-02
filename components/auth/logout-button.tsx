"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    setLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setLoading(false);
      router.push("/auth/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className="rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5 text-xs font-semibold text-accent hover:bg-accent hover:text-white transition-all duration-200 disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}

