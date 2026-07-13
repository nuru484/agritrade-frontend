import * as React from "react"

import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-[2px] border-[1.5px] border-soil/35 bg-paper px-3 py-2 text-base text-ink transition-[border-color,box-shadow] outline-none placeholder:text-soil/55 focus-visible:border-leaf focus-visible:shadow-[0_0_0_3px_rgb(62_125_98/0.16)] focus-visible:ring-0 disabled:cursor-not-allowed disabled:bg-surface-alt disabled:opacity-60 aria-invalid:border-error md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
