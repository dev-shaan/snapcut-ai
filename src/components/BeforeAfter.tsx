import { useCallback, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

type BeforeAfterProps = {
  before: string;
  after: string;
  className?: string;
};

export function BeforeAfter({ before, after, className }: BeforeAfterProps) {
  const [position, setPosition] = useState(52);
  const containerRef = useRef<HTMLDivElement>(null);

  const updateFromClientX = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, pct)));
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-square w-full select-none overflow-hidden rounded-2xl border border-border",
        className,
      )}
      onPointerMove={(e) => {
        if (e.buttons === 1) updateFromClientX(e.clientX);
      }}
      onPointerDown={(e) => updateFromClientX(e.clientX)}
    >
      <img
        src={before}
        alt="Original photo with background"
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 checkerboard"
        style={{ clipPath: `inset(0 0 0 ${position}%)` }}
      >
        <img
          src={after}
          alt="Same photo with the background removed"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </div>

      <div
        className="absolute inset-y-0 w-0.5 bg-primary"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      >
        <span className="absolute top-1/2 left-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-200 group-hover:scale-110">
          <MoveHorizontal className="h-5 w-5" />
        </span>
      </div>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label="Compare before and after"
        className="absolute inset-x-0 bottom-0 h-10 w-full cursor-ew-resize opacity-0"
      />

      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-background/75 px-3 py-1 text-xs font-medium">
        Before
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-background/75 px-3 py-1 text-xs font-medium text-primary">
        After
      </span>
    </div>
  );
}
