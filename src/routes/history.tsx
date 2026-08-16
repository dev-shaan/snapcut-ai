import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Download, ImageOff, RefreshCw, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { EmptyState } from "@/components/EmptyState";
import { Button, buttonClasses } from "@/components/Button";
import { getHistory, type HistoryRecord } from "@/lib/api";
import { cn } from "@/lib/utils";

const filters = ["all", "completed", "processing", "failed"] as const;
type Filter = (typeof filters)[number];

const statusStyles: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
  processing: "bg-primary/15 text-primary border border-primary/30",
  failed: "bg-destructive/15 text-destructive border border-destructive/30",
};

export function HistoryPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [historyItems, setHistoryItems] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getHistory();
      setHistoryItems(response.history || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load processing history.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDownload = async (url: string, id: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `snapcut-cutout-${id.substring(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(url, "_blank");
    }
  };

  const filteredItems = historyItems.filter(
    (item) => filter === "all" || item.status.toLowerCase() === filter,
  );

  return (
    <AppLayout title="Processing history" subtitle="Every image you've cut out with SnapCut AI.">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {filters.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm capitalize transition-colors",
                filter === value
                  ? "border-primary/60 bg-primary/10 text-primary font-medium"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {value}
            </button>
          ))}
        </div>

        <Button variant="ghost" size="sm" onClick={fetchHistory} disabled={loading}>
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} aria-hidden="true" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="flex h-64 w-full items-center justify-center rounded-2xl border border-border bg-surface/30">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <span className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-sm font-medium">Loading history...</span>
          </div>
        </div>
      ) : error ? (
        <div className="space-y-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
            <AlertCircle className="h-6 w-6" aria-hidden="true" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground">
            Failed to load history
          </h3>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{error}</p>
          <div className="flex justify-center gap-3 pt-2">
            <Button size="md" onClick={fetchHistory}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </Button>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={ImageOff}
          title={historyItems.length === 0 ? "No processed images yet" : "Nothing matching filter"}
          description={
            historyItems.length === 0
              ? "Upload an image to SnapCut AI to cut out the background and see your history here."
              : "No images match this status filter."
          }
          action={
            <Link to="/dashboard" className={buttonClasses("primary", "md")}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Remove a background
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const formattedDate = new Date(item.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-border bg-surface/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50"
              >
                <div className="checkerboard aspect-4/3 overflow-hidden">
                  <img
                    src={item.processed_url || item.original_url}
                    alt="Processed cutout"
                    loading="lazy"
                    className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-medium">Cutout #{item.id.substring(0, 8)}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">{formattedDate}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                        statusStyles[item.status] || "bg-surface text-muted-foreground",
                      )}
                    >
                      {item.status}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={item.status !== "completed"}
                    onClick={() => handleDownload(item.processed_url, item.id)}
                  >
                    <Download className="h-4 w-4" aria-hidden="true" />
                    Download PNG
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
}

export default HistoryPage;
