import { ImageIcon, X } from "lucide-react";

type ImagePreviewProps = {
  src: string;
  filename: string;
  size: string;
  onRemove: () => void;
};

export function ImagePreview({ src, filename, size, onRemove }: ImagePreviewProps) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface/50 p-4">
      <img
        src={src}
        alt={filename}
        loading="lazy"
        className="h-16 w-16 shrink-0 rounded-xl object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 truncate text-sm font-medium">
          <ImageIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="truncate">{filename}</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{size} · ready to process</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${filename}`}
        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
