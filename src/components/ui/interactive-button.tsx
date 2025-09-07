"use client";

import { Button } from "@/components/ui/button";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";

interface InteractiveButtonProps extends 
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof Button> {
  hoverScale?: boolean;
  hoverGlow?: boolean;
  asChild?: boolean;
}

const InteractiveButton = forwardRef<
  HTMLButtonElement,
  InteractiveButtonProps
>(({ className, hoverScale = true, hoverGlow = false, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        "cursor-pointer transition-all duration-200",
        hoverScale && "hover:scale-[1.02] active:scale-[0.98]",
        hoverGlow && "hover:shadow-lg hover:shadow-primary/25",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
});
InteractiveButton.displayName = "InteractiveButton";

export { InteractiveButton };
