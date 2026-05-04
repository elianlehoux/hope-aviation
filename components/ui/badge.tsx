import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-xs font-semibold whitespace-nowrap transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-[#1749ff] text-white",
        secondary: "bg-[rgba(23,73,255,0.15)] text-[#1749ff] border border-[#1749ff]/20",
        destructive: "bg-[rgba(255,123,145,0.15)] text-[#E41E3F] border border-[#E41E3F]/20",
        success: "bg-[rgba(36,228,0,0.15)] text-[#007D1E] border border-[#007D1E]/20",
        warning: "bg-[rgba(255,170,0,0.15)] text-[#ffaa00] border border-[#ffaa00]/20",
        outline: "border-[#CED0D4] text-[#00263e]",
        ghost: "hover:bg-slate-100 hover:text-[#1749ff]",
        link: "text-[#1749ff] underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
