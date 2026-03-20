import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const titleVariants = cva("font-bold tracking-tight text-primary", {
  variants: {
    level: {
      h1: "text-4xl lg:text-5xl font-extrabold tracking-tighter",
      h2: "text-3xl font-extrabold tracking-tight",
      h3: "text-2xl font-bold tracking-tight",
      h4: "text-xl font-bold leading-tight",
      h5: "text-lg font-semibold",
      h6: "text-base font-semibold",
    },
  },
  defaultVariants: {
    level: "h1",
  },
});

export interface TitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  ({ className, level, as, ...props }, ref) => {
    const Component = as || (level as "h1" | "h2" | "h3" | "h4" | "h5" | "h6") || "h1";
    return (
      <Component
        ref={ref}
        className={cn(titleVariants({ level, className }))}
        {...props}
      />
    );
  }
);
Title.displayName = "Title";

export { Title, titleVariants };
