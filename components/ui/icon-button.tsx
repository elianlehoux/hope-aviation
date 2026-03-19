"use client";

import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends ButtonProps {
  icon: React.ReactNode;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        size="icon"
        className={cn("h-10 w-10 p-0", className)}
        {...props}
      >
        {icon}
        {children && <span className="sr-only">{children}</span>}
      </Button>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton };
