import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-sm text-stone-800 shadow-sm transition-colors duration-300 ease-in-out placeholder:text-stone-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
