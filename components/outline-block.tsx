"use client"

import type React from "react"
import { memo } from "react"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditableField } from "@/components/ui/editable-field"
import { EditableArea } from "@/components/ui/editable-area"
import type { OutlineBlock as OutlineBlockType } from "@/lib/types"
import { cn, getBlockStyles, getTextAreaStyles } from "@/lib/utils"

interface OutlineBlockProps {
  block: OutlineBlockType
  blockIndex: number
  sectionIndex: number
  onContentChange: (sectionIndex: number, blockIndex: number, newContent: string) => void
  onLabelChange: (sectionIndex: number, blockIndex: number, newLabel: string) => void
  onResetLabel: (sectionIndex: number, blockIndex: number) => void
  onRemoveBlock: (sectionIndex: number, blockIndex: number) => void
  showRemoveButton: boolean
  isNew?: boolean
  isDragging?: boolean
}

export const OutlineBlock = memo(function OutlineBlock({
  block,
  blockIndex,
  sectionIndex,
  onContentChange,
  onLabelChange,
  onResetLabel,
  onRemoveBlock,
  showRemoveButton,
  isNew = false,
  isDragging = false,
}: OutlineBlockProps) {
  const blockId = `block-${block.id}`

  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSorting } = useSortable({
    id: block.id,
    data: {
      type: "block",
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging || isSorting ? undefined : transition,
    opacity: isDragging || isSorting ? 0.6 : 1,
    zIndex: isDragging || isSorting ? 50 : 0,
  }


  if (isDragging || isSorting) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 min-h-[100px] w-full",
        )}
      />
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border p-2.5 sm:p-4 transition-all duration-200 shadow-sm outline-none",
        isDragging ? "shadow-xl scale-[1.02] ring-2 ring-primary/20 bg-card" : "",
        getBlockStyles(block.type)
      )}
    >
      <div className="flex items-start gap-2 sm:gap-3">
        <button
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab mt-1 p-1 sm:p-1.5 rounded-md hover:bg-muted hover:text-primary transition-all bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-muted/50 active:cursor-grabbing"
          data-drag-handle
          aria-label={`Drag to reorder block: ${block.label}`}
          aria-roledescription="drag handle"
          aria-describedby="dnd-instructions"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </button>

        <div className="flex-grow space-y-2 sm:space-y-3 group/block min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-grow min-w-0 overflow-hidden">
              <div className="relative min-w-[80px] xs:min-w-[120px] max-w-full flex items-center">
                <EditableField
                  id={`${blockId}-label`}
                  value={block.label}
                  onSave={(newLabel) => onLabelChange(sectionIndex, blockIndex, newLabel)}
                  label="block label"
                  className="text-[10px] sm:text-xs font-bold text-inherit opacity-70 uppercase tracking-widest px-1.5 py-0.5 bg-muted/30 rounded w-full min-w-0"
                  inputClassName="h-7 text-[10px] sm:text-xs font-bold rounded-md bg-background border-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                  renderValue={(val) => (
                    <span className="truncate mr-1">{val}</span>
                  )}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onResetLabel(sectionIndex, blockIndex);
                }}
                className="h-6 px-1.5 xs:px-2 text-[10px] sm:text-xs font-bold uppercase tracking-tight hover:bg-muted/50 rounded-md text-inherit shrink-0 flex items-center gap-1"
                aria-label={`Reset label for block ${block.label} to default`}
              >
                <span className="hidden xs:inline">Reset</span>
                <RefreshCw className="h-3 w-3 text-muted-foreground" />
              </Button>
              {showRemoveButton && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => onRemoveBlock(sectionIndex, blockIndex)}
                  className="h-6 w-6 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">Remove block: {block.label}</span>
                </Button>
              )}
            </div>
          </div>

          <div className="min-h-[50px] sm:min-h-[60px] w-full" style={{ whiteSpace: 'pre-line' }}>
            <EditableArea
              id={`${blockId}-content`}
              value={block.content}
              onSave={(newContent) => onContentChange(sectionIndex, blockIndex, newContent)}
              label={`content for ${block.label}`}
              placeholder={block.placeholder}
              textareaClassName={cn(
                "min-h-[60px] sm:min-h-[70px] p-2 sm:p-3 rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary",
                getTextAreaStyles(block.type)
              )}
              className={cn(
                "min-h-[50px] sm:min-h-[60px] p-2 sm:p-3 rounded-lg text-sm font-medium group-hover/block:border-muted-foreground/10",
                block.content ? "bg-muted/5 text-foreground" : "bg-muted/20 text-muted-foreground/50 dark:text-muted-foreground/60 italic"
              )}
              autoFocus={isNew}
            />
          </div>
        </div>
      </div>
    </div>
  )
})
