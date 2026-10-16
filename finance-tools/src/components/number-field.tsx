"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type NumberFieldProps = {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  hint?: React.ReactNode
  decimals?: number
  min?: number
  max?: number
  className?: string
  size?: "default" | "lg"
}

function toText(value: number, decimals: number): string {
  if (!Number.isFinite(value)) return ""
  if (decimals === 0) return Math.round(value).toLocaleString("en-US")
  return String(Number(value.toFixed(decimals)))
}

export function NumberField({
  id,
  label,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  decimals = 0,
  min,
  max,
  className,
  size = "default",
}: NumberFieldProps) {
  const [text, setText] = React.useState(() => toText(value, decimals))
  const [focused, setFocused] = React.useState(false)
  const shown = focused ? text : toText(value, decimals)

  const clamp = (n: number) => {
    let next = n
    if (min !== undefined) next = Math.max(min, next)
    if (max !== undefined) next = Math.min(max, next)
    return next
  }

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={id} className="text-[13px] font-medium text-foreground/80">
        {label}
      </Label>
      <div
        className={cn(
          "flex items-center rounded-lg border border-input bg-card transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/20",
          size === "lg" ? "h-12 px-3.5" : "h-10 px-3",
        )}
      >
        {prefix ? <span className="mr-2 text-sm text-muted-foreground">{prefix}</span> : null}
        <Input
          id={id}
          inputMode={decimals > 0 ? "decimal" : "numeric"}
          autoComplete="off"
          value={shown}
          onFocus={() => {
            setText(toText(value, decimals).replaceAll(",", ""))
            setFocused(true)
          }}
          onBlur={() => setFocused(false)}
          onChange={(event) => {
            const cleaned = event.target.value.replace(decimals > 0 ? /[^\d.-]/g : /[^\d]/g, "")
            setText(cleaned)
            const parsed = Number(cleaned)
            if (cleaned === "" || cleaned === "-" || cleaned === ".") {
              onChange(clamp(0))
            } else if (Number.isFinite(parsed)) {
              onChange(clamp(parsed))
            }
          }}
          className={cn(
            "h-full border-0 bg-transparent px-0 tabular-nums shadow-none focus-visible:ring-0 dark:bg-transparent",
            size === "lg" ? "text-xl font-semibold md:text-xl" : "text-base md:text-[15px]",
          )}
        />
        {suffix ? <span className="ml-2 shrink-0 text-sm text-muted-foreground">{suffix}</span> : null}
      </div>
      {hint ? <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  )
}
