"use client"

import { useState } from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DatePicker({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (date: string) => void
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const date = value ? new Date(value) : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn("h-9 w-fit min-w-36 justify-start text-left text-xs font-normal", !value && "text-muted-foreground", className)}
          />
        }
      >
        <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0" />
        {value ? new Date(value).toLocaleDateString("en-IN") : "Pick a date"}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              onChange(d.toISOString().split("T")[0])
              setOpen(false)
            }
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
