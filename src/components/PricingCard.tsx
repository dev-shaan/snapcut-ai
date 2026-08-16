import { Check } from "lucide-react";
import { Button } from "@/components/Button";
import type { Plan } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type PricingCardProps = {
  plan: Plan;
  yearly?: boolean;
  onSelect?: (plan: Plan) => void;
};

export function PricingCard({ plan, yearly = false, onSelect }: PricingCardProps) {
  const price = yearly ? plan.priceYearly : plan.priceMonthly;
  const suffix = plan.priceMonthly === 0 ? "" : yearly ? "/year" : "/month";

  return (
    <article
      className={cn(
        "relative flex flex-col rounded-2xl border p-7 transition-all duration-300 hover:-translate-y-1",
        plan.highlighted
          ? "border-primary/60 bg-surface glow-ring"
          : "border-border bg-surface/50 hover:border-primary/40",
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-7 rounded-full bg-[image:var(--gradient-brand)] px-3 py-1 text-xs font-semibold text-primary-foreground">
          Most popular
        </span>
      )}

      <h3 className="font-display text-lg font-semibold">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>

      <p className="mt-6 flex items-baseline gap-1">
        <span className="font-display text-4xl font-bold">₹{price}</span>
        <span className="text-sm text-muted-foreground">{suffix}</span>
      </p>
      <p className="mt-1 text-sm text-primary">{plan.credits}</p>

      <ul className="mt-6 flex-1 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>

      <Button
        className="mt-7 w-full"
        variant={plan.highlighted ? "primary" : "outline"}
        onClick={() => onSelect?.(plan)}
      >
        {plan.cta}
      </Button>
    </article>
  );
}
