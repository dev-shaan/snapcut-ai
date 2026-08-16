import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="SnapCut AI home"
      className={cn("group inline-flex items-center gap-2.5", className)}
    >
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-[image:var(--gradient-brand)] transition-transform duration-300 group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 text-primary-foreground"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 4h6v6" />
          <path d="M20 20h-6v-6" />
          <path d="M20 4 4 20" />
        </svg>
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">
        SnapCut <span className="text-gradient">AI</span>
      </span>
    </Link>
  );
}
