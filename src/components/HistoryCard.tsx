import { Download } from "lucide-react";
import type { HistoryItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<HistoryItem["status"], string> = {
  completed: "bg-success/15 text-success",
  processing: "bg-primary/15 text-primary",
  failed: "bg-destructive/15 text-destructive",
};

export function HistoryCard({ item }: { item: HistoryItem }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-surface/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
      <div className="checkerboard aspect-4/3 overflow-hidden">
        <img
          src={item.thumbnail}
          alt={item.filename}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-medium">{item.filename}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.date} · {item.size}
            </p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
              statusStyles[item.status],
            )}
          >
            {item.status}
          </span>
        </div>
        <button
          type="button"
          disabled={item.status !== "completed"}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2 text-sm transition-colors hover:border-primary/60 hover:text-primary disabled:pointer-events-none disabled:opacity-40"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          Download
        </button>
      </div>
    </article>
  );
}
