import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 focus-visible:outline-hidden focus-visible:ring-[3px] focus-visible:ring-ring disabled:pointer-events-none disabled:bg-[#DEE3E9] disabled:text-[#8595A4] aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground font-normal tracking-[-0.14px] hover:bg-accent-hover active:bg-accent-pressed active:scale-[0.98] border-none",
        destructive:
          "bg-destructive text-white hover:opacity-90",
        outline: // Map outline to Secondary (Outlined Pill)
          "bg-transparent text-primary/50 border-2 border-primary/12 font-normal tracking-[-0.14px] hover:bg-accent/70 hover:text-white hover:border-transparent active:scale-95",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: // Ghost/Link Button
          "bg-transparent text-accent rounded-[24px] hover:bg-black/5 active:scale-95",
        link: "text-accent underline-offset-4 hover:underline",
      },
      size: {
        default: "px-[22px] py-[10px]",
        xs: "h-7 gap-1 px-3 text-xs",
        sm: "h-9 gap-1.5 px-4",
        lg: "h-12 px-8 text-base",
        icon: "size-11",
        "icon-xs": "size-7",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
        ghost: "px-[12px] py-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
