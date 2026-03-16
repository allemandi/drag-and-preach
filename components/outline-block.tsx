"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OutlineBlock as OutlineBlockType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface OutlineBlockProps {
  block: OutlineBlockType
  onChange: (newContent: string) => void
  onLabelChange: (newLabel: string) => void
  onResetLabel: () => void
  onRemoveBlock: () => void
  showRemoveButton: boolean
}

export function OutlineBlock({
  block,
  onChange,
  onLabelChange,
  onResetLabel,
  onRemoveBlock,
  showRemoveButton,
}: OutlineBlockProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [content, setContent] = useState(block.content)
  const [labelValue, setLabelValue] = useState(block.label)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [isEditing])

  useEffect(() => {
    setContent(block.content)
  }, [block.content])

  useEffect(() => {
    setLabelValue(block.label)
  }, [block.label])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value
    setContent(newContent)

    // Auto-resize textarea
    e.target.style.height = "auto"
    e.target.style.height = `${e.target.scrollHeight}px`

    onChange(newContent)
  }

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabelValue(e.target.value)
  }

  const handleLabelBlur = () => {
    onLabelChange(labelValue)
    setIsEditingLabel(false)
  }

  const handleLabelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleLabelBlur()
    }
  }

  const getBlockStyles = (type: string) => {
    switch (type) {
      case "intro":
        return "bg-background border-pastel-border-blue/50 hover:border-pastel-border-blue"
      case "body":
        return "bg-background border-pastel-border-green/50 hover:border-pastel-border-green"
      case "conclusion":
        return "bg-background border-pastel-border-amber/50 hover:border-pastel-border-amber"
      default:
        return "bg-background border-pastel-border-purple/50 hover:border-pastel-border-purple"
    }
  }

  const getTextAreaStyles = (type: string) => {
    switch (type) {
      case "intro":
        return "focus:ring-pastel-border-blue"
      case "body":
        return "focus:ring-pastel-border-green"
      case "conclusion":
        return "focus:ring-pastel-border-amber"
      default:
        return "focus:ring-pastel-border-purple"
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border-2 p-4 transition-all duration-200 shadow-sm",
        isDragging ? "z-10 shadow-xl scale-[1.02]" : "",
        getBlockStyles(block.type)
      )}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab mt-1 p-1 rounded-md hover:bg-muted transition-colors"
          data-drag-handle
          tabIndex={0}
          aria-label="Drag to reorder block"
          role="button"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-grow space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEditingLabel ? (
                <Input
                  value={labelValue}
                  onChange={handleLabelChange}
                  onBlur={handleLabelBlur}
                  onKeyDown={handleLabelKeyDown}
                  className="max-w-[200px] h-8 text-sm font-semibold"
                  autoFocus
                />
              ) : (
                <label
                  className="text-sm font-semibold text-foreground/80 cursor-pointer hover:text-foreground transition-colors uppercase tracking-wider"
                  onClick={() => setIsEditingLabel(true)}
                >
                  {block.label}
                </label>
              )}
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onResetLabel();
                }}
                className="h-7 px-2 text-xs hover:bg-muted/50"
              >
                <span className="hidden sm:inline">Reset Label</span>
                <RefreshCw className="h-3 w-3 sm:ml-1" />
              </Button>
              {showRemoveButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemoveBlock}
                  className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove block</span>
                </Button>
              )}
            </div>
          </div>

          <div className="min-h-[60px] w-full" style={{ whiteSpace: 'pre-line' }} onClick={() => setIsEditing(true)}>
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onBlur={() => setIsEditing(false)}
                className={cn(
                  "w-full min-h-[80px] p-3 rounded-lg bg-muted/30 focus:outline-none focus:ring-2 transition-all",
                  getTextAreaStyles(block.type)
                )}
                placeholder={block.placeholder}
                rows={1}
              />
            ) : (
              <div
                className={cn(
                  "w-full min-h-[60px] p-3 rounded-lg transition-colors cursor-text",
                  content ? "bg-muted/20" : "bg-muted/50 text-muted-foreground italic"
                )}
              >
                {content || block.placeholder}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
