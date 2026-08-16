import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium whitespace-nowrap transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary:
    "bg-[image:var(--gradient-brand)] text-primary-foreground shadow-[0_16px_40px_-22px_var(--color-primary)] hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0",
  secondary: "bg-secondary text-secondary-foreground hover:bg-muted hover:-translate-y-0.5",
  outline:
    "border border-border bg-transparent text-foreground hover:border-primary/60 hover:bg-surface/60",
  ghost: "text-muted-foreground hover:text-foreground hover:bg-surface/70",
  danger: "border border-destructive/40 text-destructive hover:bg-destructive/10",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children?: ReactNode;
};

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export const buttonClasses = (variant: Variant = "primary", size: Size = "md") =>
  cn(base, variants[variant], sizes[size]);
