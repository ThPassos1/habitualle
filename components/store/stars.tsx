import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Nota ${rating} de 5`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < Math.round(rating);
        return (
          <Star
            key={index}
            className={cn(
              "h-3.5 w-3.5",
              filled ? "fill-terracotta-400 text-terracotta-400" : "text-stone-300",
            )}
          />
        );
      })}
    </div>
  );
}
