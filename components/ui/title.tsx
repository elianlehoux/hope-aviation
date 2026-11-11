import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const titleVariants = cva("text-primary font-sans tracking-tight", {
  variants: {
    level: {
      display1: "text-[64px] font-medium leading-[1.16]",
      display2: "text-[48px] font-medium leading-[1.17]",
      h1: "text-[36px] font-medium leading-[1.28]",
      h2: "text-[28px] font-light leading-[1.21]",
      h3: "text-[18px] font-bold leading-[1.44]",
      h4: "text-[16px] font-medium leading-[1.50]",
      h5: "text-[14px] font-bold leading-[1.43]",
      h6: "text-[14px] font-regular leading-[1.43]",
    },
  },
  defaultVariants: {
    level: "h1",
  },
});

export interface TitleProps
  extends React.HTMLAttributes<HTMLHeadingElement>,
    VariantProps<typeof titleVariants> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p";
}

const Title = React.forwardRef<HTMLHeadingElement, TitleProps>(
  ({ className, level, as, ...props }, ref) => {
    // Display levels are sizes, not elements: default them to h1 unless `as` says otherwise.
    const Component =
      as ?? (!level || level === "display1" || level === "display2" ? "h1" : level);
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
