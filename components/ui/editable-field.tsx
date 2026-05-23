"use client"

import * as React from "react"
import { Pencil } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface EditableFieldProps {
  value: string
  onSave: (value: string) => void
  onCancel?: () => void
  label: string
  className?: string
  inputClassName?: string
  id?: string
  autoFocus?: boolean
  renderValue?: (value: string) => React.ReactNode
}

export function EditableField({
  value,
  onSave,
  onCancel,
  label,
  className,
  inputClassName,
  id,
  autoFocus = false,
  renderValue,
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = React.useState(autoFocus)
  const [localValue, setLocalValue] = React.useState(value)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  const handleBlur = () => {
    if (localValue !== value) {
      onSave(localValue)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleBlur()
    } else if (e.key === "Escape") {
      setLocalValue(value)
      onCancel?.()
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <Input
        id={id ? `${id}-input` : undefined}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn("h-auto py-1 focus-visible:ring-offset-2", inputClassName)}
        autoFocus
        aria-label={`Edit ${label}`}
      />
    )
  }

  return (
    <button
      id={id ? `${id}-button` : undefined}
      type="button"
      className={cn(
        "group/editable flex items-center gap-2 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-md border-2 border-transparent",
        className
      )}
      onClick={() => setIsEditing(true)}
      aria-label={value ? `Edit ${label}: ${value}` : `Add ${label}`}
    >
      {renderValue ? renderValue(value) : <span>{value || <span className="opacity-50 italic">Click to add {label}</span>}</span>}
      <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-20 group-hover/editable:opacity-100 group-focus-visible/editable:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
    </button>
  )
}
