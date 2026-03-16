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
        return "bg-background border-pastel-border-blue hover:border-pastel-border-blue/80 shadow-blue-900/5 dark:shadow-blue-100/5"
      case "body":
        return "bg-background border-pastel-border-green hover:border-pastel-border-green/80 shadow-green-900/5 dark:shadow-green-100/5"
      case "conclusion":
        return "bg-background border-pastel-border-amber hover:border-pastel-border-amber/80 shadow-amber-900/5 dark:shadow-amber-100/5"
      default:
        return "bg-background border-pastel-border-purple hover:border-pastel-border-purple/80 shadow-purple-900/5 dark:shadow-purple-100/5"
    }
  }

  const getTextAreaStyles = (type: string) => {
    switch (type) {
      case "intro":
        return "focus:ring-pastel-border-blue/30"
      case "body":
        return "focus:ring-pastel-border-green/30"
      case "conclusion":
        return "focus:ring-pastel-border-amber/30"
      default:
        return "focus:ring-pastel-border-purple/30"
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border-2 p-6 transition-all duration-300 shadow-sm",
        isDragging ? "z-20 shadow-2xl scale-[1.03] ring-4 ring-primary/10" : "",
        getBlockStyles(block.type)
      )}
    >
      <div className="flex items-start gap-5">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab mt-1 p-2 rounded-xl hover:bg-muted transition-colors bg-muted/30"
          data-drag-handle
          tabIndex={0}
          aria-label="Drag to reorder block"
          role="button"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="h-6 w-6 text-muted-foreground" />
        </div>

        <div className="flex-grow space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isEditingLabel ? (
                <Input
                  value={labelValue}
                  onChange={handleLabelChange}
                  onBlur={handleLabelBlur}
                  onKeyDown={handleLabelKeyDown}
                  className="max-w-[220px] h-9 text-sm font-bold rounded-lg"
                  autoFocus
                />
              ) : (
                <label
                  className="text-xs font-black text-foreground/60 uppercase tracking-widest cursor-pointer hover:text-foreground transition-colors py-1 px-2 bg-muted/50 rounded-md"
                  onClick={() => setIsEditingLabel(true)}
                >
                  {block.label}
                </label>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onResetLabel();
                }}
                className="h-8 px-3 text-[10px] font-black uppercase tracking-tighter hover:bg-muted/50 rounded-lg"
              >
                <span>Reset Label</span>
                <RefreshCw className="h-3 w-3 ml-2" />
              </Button>
              {showRemoveButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemoveBlock}
                  className="h-8 w-8 rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove block</span>
                </Button>
              )}
            </div>
          </div>

          <div className="min-h-[80px] w-full" style={{ whiteSpace: 'pre-line' }} onClick={() => setIsEditing(true)}>
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onBlur={() => setIsEditing(false)}
                className={cn(
                  "w-full min-h-[100px] p-4 rounded-xl bg-muted/40 focus:outline-none focus:ring-4 transition-all text-lg font-medium",
                  getTextAreaStyles(block.type)
                )}
                placeholder={block.placeholder}
                rows={1}
              />
            ) : (
              <div
                className={cn(
                  "w-full min-h-[80px] p-4 rounded-xl transition-all cursor-text text-lg font-medium border-2 border-transparent",
                  content ? "bg-muted/10" : "bg-muted/30 text-muted-foreground/60 italic"
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
