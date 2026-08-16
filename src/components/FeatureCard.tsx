import type { LucideIcon } from "lucide-react";

type FeatureCardProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-surface/50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 [background:var(--gradient-glow)] group-hover:opacity-100" />
      <span className="relative grid h-11 w-11 place-items-center rounded-xl border border-border bg-background/70 text-primary">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <h3 className="relative mt-5 text-base font-semibold">{title}</h3>
      <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </article>
  );
}
