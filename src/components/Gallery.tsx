import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { galleryItems } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function Gallery({ className }: { className?: string }) {
  const trackRef = useRef<HTMLUListElement>(null);

  const scrollBy = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)}>
      <ul
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {galleryItems.map((item) => (
          <li
            key={item.id}
            className="group w-64 shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-surface/50 transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 sm:w-72"
          >
            <div className="checkerboard aspect-square">
              <img
                src={item.image}
                alt={`${item.label} cutout example`}
                loading="lazy"
                className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <p className="px-4 py-3 text-sm text-muted-foreground">{item.label}</p>
          </li>
        ))}
      </ul>

      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollBy(-1)}
          aria-label="Previous examples"
          className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-primary/60 hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollBy(1)}
          aria-label="Next examples"
          className="grid h-10 w-10 place-items-center rounded-full border border-border transition-colors hover:border-primary/60 hover:text-primary"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
