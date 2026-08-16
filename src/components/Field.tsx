import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
};

export function Field({ label, id, className, ...props }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={id}
        className={cn(
          "h-11 w-full rounded-xl border border-input bg-background/60 px-3.5 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-ring/40",
          className,
        )}
        {...props}
      />
    </div>
  );
}
