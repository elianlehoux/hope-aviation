"use client";

import { usePathname } from "next/navigation";
import { isClassroomPath } from "./CampusSidebar";

/** Renders campus chrome (header) everywhere except the focused classroom. */
export function HideInClassroom({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return isClassroomPath(pathname) ? null : <>{children}</>;
}

/** Main content area: padded pages, full-bleed classroom. */
export function CampusMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const classroom = isClassroomPath(pathname);
  return (
    <main className={classroom ? "flex-1" : "flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10"}>
      {children}
    </main>
  );
}
