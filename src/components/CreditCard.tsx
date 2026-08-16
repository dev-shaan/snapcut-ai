import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/Button";
import { cn } from "@/lib/utils";

type CreditCardProps = {
  credits: number;
  total: number;
};

export function CreditCard({ credits, total }: CreditCardProps) {
  const safeCredits = Math.max(0, credits);
  const pct = total > 0 ? Math.round((safeCredits / total) * 100) : 0;

  return (
    <section
      aria-label="Credit balance"
      className="rounded-2xl border border-border bg-surface/50 p-6"
    >
      <div className="flex items-center gap-2 text-primary">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        <span className="text-xs font-semibold tracking-wide uppercase">Credits</span>
      </div>
      <p className="mt-3 font-display text-2xl font-bold">
        {safeCredits} {safeCredits === 1 ? "Credit" : "Credits"} remaining
      </p>
      <div
        className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={safeCredits}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <span
          className="block h-full rounded-full bg-[image:var(--gradient-brand)] transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        {safeCredits} of {total} credits left on your current plan
      </p>
      <Link to="/pricing" className={cn(buttonClasses("outline", "sm"), "mt-5 w-full")}>
        Upgrade Plan
      </Link>
    </section>
  );
}
