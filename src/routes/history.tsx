import { useState } from "react";
import { Link } from "react-router-dom";
import { ImageOff } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { HistoryCard } from "@/components/HistoryCard";
import { EmptyState } from "@/components/EmptyState";
import { buttonClasses } from "@/components/Button";
import { historyItems, type HistoryStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const filters = ["all", "completed", "processing", "failed"] as const;
type Filter = (typeof filters)[number];

export function HistoryPage() {
  const [filter, setFilter] = useState<Filter>("all");

  const items = historyItems.filter(
    (item) => filter === "all" || item.status === (filter as HistoryStatus),
  );

  return (
    <AppLayout title="Processing history" subtitle="Every image you've cut out with SnapCut AI.">
      <div className="mb-6 flex flex-wrap gap-2">
        {filters.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm capitalize transition-colors",
              filter === value
                ? "border-primary/60 bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ImageOff}
          title="Nothing here yet"
          description="No images match this filter. Process a new image to see it appear here."
          action={
            <Link to="/dashboard" className={buttonClasses("primary", "md")}>
              Remove a background
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => (
            <HistoryCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </AppLayout>
  );
}

export default HistoryPage;
