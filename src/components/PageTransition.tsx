import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";

/** Re-mounts on route change so the fade/slide animation replays. */
export function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div key={location.pathname} className="animate-[var(--animate-fade-up)]">
      {children}
    </div>
  );
}
