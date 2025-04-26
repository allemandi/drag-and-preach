"use client"

import type React from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"

interface SortableSectionProps {
  id: string
  children: React.ReactNode
}

export function SortableSection({ id, children }: SortableSectionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative" as const,
    zIndex: isDragging ? 1 : 0,
    whiteSpace: 'pre-line',
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        className="absolute top-4 left-4 cursor-grab p-1 rounded hover:bg-muted z-10"
        {...attributes}
        {...listeners}
        data-drag-handle
        tabIndex={0}
        aria-label="Drag to reorder section"
        role="button"
        style={{touchAction: "none"}}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      {children}
    </div>
  )
}
