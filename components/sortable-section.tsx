"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

interface SortableSectionProps {
  id: string
  children: React.ReactNode
}

export function SortableSection({ id, children, title }: SortableSectionProps & { title: string }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
    id,
    data: {
      type: "section",
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: 'opacity 100ms ease',
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 1 : 0,
    whiteSpace: 'pre-line',
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <button
        type="button"
        className="absolute top-6 left-2 sm:left-4 cursor-grab p-1 rounded hover:bg-muted z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
        {...attributes}
        {...listeners}
        data-drag-handle
        aria-label={`Drag to reorder section: ${title}`}
        aria-roledescription="drag handle"
        aria-describedby="dnd-instructions"
        style={{ touchAction: "none" }}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      {children}
    </div>
  )
}
