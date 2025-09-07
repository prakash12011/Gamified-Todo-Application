"use client";

import { Card } from "@/components/ui/card";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InteractiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverScale?: boolean;
  hoverGlow?: boolean;
  isClickable?: boolean;
}

const InteractiveCard = forwardRef<
  HTMLDivElement,
  InteractiveCardProps
>(({ className, hoverScale = false, hoverGlow = true, isClickable = false, ...props }, ref) => {
  return (
    <Card
      ref={ref}
      className={cn(
        "transition-all duration-200",
        hoverGlow && "hover:shadow-md",
        hoverScale && "hover:scale-[1.02]",
        isClickable && "cursor-pointer hover:shadow-lg",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        className
      )}
      {...props}
    />
  );
});
InteractiveCard.displayName = "InteractiveCard";

export { InteractiveCard };
