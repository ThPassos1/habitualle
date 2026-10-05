import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-stone-50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-sand-700 text-sand-50 shadow-sm hover:bg-sand-800",
        secondary: "bg-sand-100 text-stone-800 hover:bg-sand-200",
        outline: "border border-stone-300 bg-transparent text-stone-800 hover:bg-sand-50",
        ghost: "text-stone-700 hover:bg-sand-100",
        light: "bg-stone-50 text-stone-800 shadow-sm hover:bg-sand-100",
        sage: "bg-sage-700 text-sage-50 shadow-sm hover:bg-sage-600",
      },
      size: {
        default: "h-10 px-5",
        sm: "h-9 px-3 text-xs",
        lg: "h-12 px-8 text-sm tracking-wide",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
