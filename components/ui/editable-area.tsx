"use client"

import * as React from "react"
import { Pencil } from "lucide-react"
import { cn } from "@/lib/utils"

interface EditableAreaProps {
  value: string
  placeholder?: string
  onSave: (value: string) => void
  onCancel?: () => void
  label: string
  className?: string
  textareaClassName?: string
  id?: string
  autoFocus?: boolean
}

export function EditableArea({
  value,
  placeholder,
  onSave,
  onCancel,
  label,
  className,
  textareaClassName,
  id,
  autoFocus = false,
}: EditableAreaProps) {
  const [isEditing, setIsEditing] = React.useState(autoFocus)
  const [localValue, setLocalValue] = React.useState(value)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    setLocalValue(value)
  }, [value])

  React.useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing])

  const handleBlur = () => {
    if (localValue !== value) {
      onSave(localValue)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setLocalValue(value)
      onCancel?.()
      setIsEditing(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalValue(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`
  }

  if (isEditing) {
    return (
      <textarea
        id={id ? `${id}-textarea` : undefined}
        ref={textareaRef}
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full min-h-[60px] p-2 rounded-lg bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all text-sm font-medium",
          textareaClassName
        )}
        placeholder={placeholder}
        rows={1}
        aria-label={`Edit ${label}`}
      />
    )
  }

  return (
    <button
      id={id ? `${id}-button` : undefined}
      type="button"
      className={cn(
        "group/editable w-full text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:rounded-md flex flex-col border-2 border-transparent",
        className
      )}
      onClick={() => setIsEditing(true)}
      aria-label={value ? `Edit ${label}: ${value.substring(0, 50)}${value.length > 50 ? "..." : ""}` : `Add ${label}`}
    >
      <div className="flex-grow break-words w-full">
        {value || <span className="opacity-50 italic">{placeholder || `Click to add ${label}`}</span>}
      </div>
      <div className="self-end mt-1 opacity-20 group-hover/editable:opacity-100 group-focus-visible/editable:opacity-100 transition-opacity">
        <Pencil className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-muted-foreground/50" aria-hidden="true" />
      </div>
    </button>
  )
}
