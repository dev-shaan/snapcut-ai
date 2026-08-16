import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Download, History, ImageIcon, RotateCcw, Sparkles } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { UploadZone } from "@/components/UploadZone";
import { ProcessingState } from "@/components/ProcessingState";
import { ImagePreview } from "@/components/ImagePreview";
import { CreditCard } from "@/components/CreditCard";
import { BeforeAfter } from "@/components/BeforeAfter";
import { Button, buttonClasses } from "@/components/Button";
import {
  checkHealth,
  getHistory,
  removeBackground,
  type HistoryRecord,
  type RemoveBackgroundResult,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

type Stage = "idle" | "selected" | "processing" | "done" | "error";

export function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth();

  const [stage, setStage] = useState<Stage>("idle");
  const [backendStatus, setBackendStatus] = useState<"loading" | "connected" | "offline">(
    "loading",
  );

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultData, setResultData] = useState<RemoveBackgroundResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [recentHistory, setRecentHistory] = useState<HistoryRecord[]>([]);

  const fetchRecentHistory = async () => {
    try {
      const res = await getHistory();
      setRecentHistory(res.history || []);
    } catch {
      setRecentHistory([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    checkHealth()
      .then((data) => {
        if (isMounted && data.status === "ok") {
          setBackendStatus("connected");
        }
      })
      .catch(() => {
        if (isMounted) {
          setBackendStatus("offline");
        }
      });

    fetchRecentHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type || !file.type.startsWith("image/")) {
      setErrorMessage("Invalid file type. Please select a PNG, JPG, JPEG or WEBP image.");
      setStage("error");
      return;
    }

    // Validate size limit (10MB)
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setErrorMessage("File size exceeds 10MB limit. Please select a smaller image.");
      setStage("error");
      return;
    }

    const url = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreviewUrl(url);
    setErrorMessage(null);
    setStage("selected");
  };

  const startProcessing = async () => {
    if (!selectedFile) return;

    setStage("processing");
    setErrorMessage(null);

    try {
      const result = await removeBackground(selectedFile);
      setResultData(result);
      await refreshProfile();
      await fetchRecentHistory();
      setStage("done");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to process image background removal.";
      setErrorMessage(msg);
      setStage("error");
    }
  };

  const handleReset = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setResultData(null);
    setErrorMessage(null);
    setStage("idle");
  };

  const handleDownload = async () => {
    if (!resultData?.processed_url) return;
    try {
      const response = await fetch(resultData.processed_url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `snapcut-${resultData.public_id.replace(/\//g, "-")}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(resultData.processed_url, "_blank");
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const userName = profile?.name || user?.user_metadata?.["name"] || "Creator";
  const userCredits = profile?.credits ?? 0;
  const userPlan = profile?.plan ? profile.plan.toUpperCase() : "FREE";

  return (
    <AppLayout
      title={`Welcome back, ${userName.split(" ")[0]}`}
      subtitle="Upload an image and SnapCut AI will cut the background out for you."
    >
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface/40 px-3 py-1 text-xs text-muted-foreground">
        <span
          className={cn(
            "h-2 w-2 rounded-full",
            backendStatus === "loading" && "bg-amber-400 animate-pulse",
            backendStatus === "connected" && "bg-emerald-400",
            backendStatus === "offline" && "bg-rose-400",
          )}
        />
        <span>
          {backendStatus === "loading" && "Checking..."}
          {backendStatus === "connected" && "Backend Connected"}
          {backendStatus === "offline" && "Backend Offline"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <section id="upload" className="space-y-6">
          {stage === "idle" && <UploadZone onSelect={handleFileSelect} />}

          {stage === "selected" && selectedFile && previewUrl && (
            <div className="space-y-4">
              <ImagePreview
                src={previewUrl}
                filename={selectedFile.name}
                size={formatFileSize(selectedFile.size)}
                onRemove={handleReset}
              />
              <Button className="w-full" size="lg" onClick={startProcessing}>
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                Remove Background · 1 credit
              </Button>
            </div>
          )}

          {stage === "processing" && <ProcessingState />}

          {stage === "done" && resultData && (
            <div className="space-y-5 rounded-2xl border border-border bg-surface/50 p-5">
              <BeforeAfter
                before={resultData.original_url || previewUrl || ""}
                after={resultData.processed_url}
              />
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1" size="lg" onClick={handleDownload}>
                  <Download className="h-4 w-4" aria-hidden="true" />
                  Download PNG
                </Button>
                <Button variant="outline" size="lg" className="flex-1" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  Process another
                </Button>
              </div>
            </div>
          )}

          {stage === "error" && (
            <div className="space-y-4 rounded-2xl border border-destructive/40 bg-destructive/10 p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/20 text-destructive">
                <AlertCircle className="h-6 w-6" aria-hidden="true" />
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {errorMessage?.includes("out of credits")
                  ? "Insufficient credits"
                  : "Background removal failed"}
              </h3>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                {errorMessage || "An unexpected error occurred while processing your image."}
              </p>
              <div className="flex justify-center gap-3 pt-2">
                {errorMessage?.includes("out of credits") ? (
                  <Link to="/pricing" className={buttonClasses("primary", "md")}>
                    Upgrade Plan
                  </Link>
                ) : selectedFile ? (
                  <Button size="md" onClick={startProcessing}>
                    Try again
                  </Button>
                ) : null}
                <Button variant="outline" size="md" onClick={handleReset}>
                  Select another image
                </Button>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Images processed", value: recentHistory.length },
              { label: "Credits remaining", value: userCredits },
              { label: "Current plan", value: userPlan },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-surface/50 p-5">
                <p className="text-xs tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </p>
                <p className="mt-2 font-display text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <CreditCard credits={userCredits} total={3} />

          <section
            aria-label="Recent images"
            className="rounded-2xl border border-border bg-surface/50 p-5"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-semibold">Recent</h2>
              <Link to="/history" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </div>
            {recentHistory.length === 0 ? (
              <p className="mt-4 text-xs text-muted-foreground">No cutouts processed yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {recentHistory.slice(0, 3).map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    <img
                      src={item.processed_url || item.original_url}
                      alt="Recent cutout"
                      loading="lazy"
                      className="h-10 w-10 shrink-0 rounded-lg object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm">Cutout #{item.id.substring(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/history" className={cn(buttonClasses("ghost", "sm"), "mt-4 w-full")}>
              <History className="h-4 w-4" aria-hidden="true" />
              Full history
            </Link>
          </section>

          <p className="flex items-start gap-2 rounded-2xl border border-border bg-surface/30 p-4 text-xs text-muted-foreground">
            <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            Best results come from images where the subject is clearly separated from the
            background.
          </p>
        </aside>
      </div>
    </AppLayout>
  );
}

export default DashboardPage;
