export function ProcessingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 rounded-2xl border border-border bg-surface/50 px-6 py-16 text-center">
      <div className="relative h-20 w-20">
        <span className="absolute inset-0 animate-spin rounded-full border-2 border-border border-t-primary" />
        <span className="absolute inset-3 animate-pulse rounded-full bg-[image:var(--gradient-brand)] opacity-70" />
      </div>
      <div>
        <p className="font-display text-lg font-semibold">Removing background…</p>
        <p className="mt-1 text-sm text-muted-foreground">AI is processing your image</p>
      </div>
      <div className="relative h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
        <span className="absolute inset-y-0 w-1/2 animate-[var(--animate-shimmer)] bg-[image:var(--gradient-brand)]" />
      </div>
    </div>
  );
}
