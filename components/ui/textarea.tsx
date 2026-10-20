import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[96px] w-full rounded-[8px] border border-border bg-white px-4 py-3 text-[16px] text-primary shadow-none transition-all duration-200 outline-hidden placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:border-accent focus-visible:ring-[3px] focus-visible:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[hsl(350,87%,55%)] aria-[invalid=true]:text-[hsl(350,87%,55%)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
