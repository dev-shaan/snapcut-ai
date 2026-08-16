import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type UploadZoneProps = {
  onSelect: (file: File) => void;
  compact?: boolean;
};

export function UploadZone({ onSelect, compact = false }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      onSelect(file);
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onSelect(file);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-2xl border-2 border-dashed transition-all duration-300",
        dragging
          ? "border-primary bg-primary/5 glow-ring"
          : "border-border bg-surface/40 hover:border-primary/50",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        aria-label="Upload an image"
        onChange={handleChange}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-3 rounded-2xl px-6 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          compact ? "py-10" : "py-16",
        )}
      >
        <span
          className={cn(
            "grid place-items-center rounded-2xl bg-[image:var(--gradient-brand)] transition-transform duration-300",
            dragging ? "scale-110" : "scale-100",
            compact ? "h-12 w-12" : "h-16 w-16",
          )}
        >
          <UploadCloud
            className={cn("text-primary-foreground", compact ? "h-6 w-6" : "h-8 w-8")}
            aria-hidden="true"
          />
        </span>
        <span className="font-display text-lg font-semibold">Drop your image here</span>
        <span className="text-sm text-muted-foreground">
          or <span className="text-primary underline-offset-4 hover:underline">browse files</span>
        </span>
        <span className="mt-1 text-xs text-muted-foreground">
          PNG, JPG, JPEG, WEBP · up to 10 MB
        </span>
      </button>
    </div>
  );
}
