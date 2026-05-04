import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-[96px] w-full rounded-[8px] border border-[#CED0D4] bg-white px-4 py-3 text-[16px] text-[#00263e] shadow-none transition-all duration-200 outline-hidden placeholder:text-[#65676B] focus-visible:outline-hidden focus-visible:border-[#1749ff] focus-visible:ring-[3px] focus-visible:ring-[#1749ff]/20 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-[hsl(350,87%,55%)] aria-[invalid=true]:text-[hsl(350,87%,55%)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
