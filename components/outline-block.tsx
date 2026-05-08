"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X, RefreshCw, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OutlineBlock as OutlineBlockType } from "@/lib/types"
import { cn, getBlockStyles, getTextAreaStyles } from "@/lib/utils"

interface OutlineBlockProps {
  block: OutlineBlockType
  onChange: (newContent: string) => void
  onLabelChange: (newLabel: string) => void
  onResetLabel: () => void
  onRemoveBlock: () => void
  showRemoveButton: boolean
  isNew?: boolean
}

export function OutlineBlock({
  block,
  onChange,
  onLabelChange,
  onResetLabel,
  onRemoveBlock,
  showRemoveButton,
  isNew = false,
}: OutlineBlockProps) {
  const [isEditing, setIsEditing] = useState(isNew)
  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [content, setContent] = useState(block.content)
  const [labelValue, setLabelValue] = useState(block.label)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const blockContentId = `block-content-${block.id}`

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: {
      type: "block",
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : 0,
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
  }

  const handleContentBlur = () => {
    onChange(content)
    setIsEditing(false)
  }

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      setContent(block.content)
      setIsEditing(false)
    }
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
    } else if (e.key === "Escape") {
      setLabelValue(block.label)
      setIsEditingLabel(false)
    }
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
              <div className="relative min-w-[80px] xs:min-w-[120px] max-w-full flex items-center group/label">
                {isEditingLabel ? (
                  <Input
                    value={labelValue}
                    onChange={handleLabelChange}
                    onBlur={handleLabelBlur}
                    onKeyDown={handleLabelKeyDown}
                    className="h-7 text-[10px] sm:text-xs font-bold rounded-md bg-background border-2 w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                    autoFocus
                    aria-label={`Edit label for ${block.label}`}
                  />
                ) : (
                  <label htmlFor={blockContentId} className="contents">
                    <button
                      className="text-[10px] sm:text-xs font-bold text-inherit opacity-70 uppercase tracking-widest cursor-pointer hover:opacity-100 transition-all px-1.5 py-0.5 bg-muted/30 rounded w-full border-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-muted/50 flex items-center justify-between overflow-hidden"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsEditingLabel(true);
                      }}
                      aria-label={`Edit label: ${block.label}`}
                    >
                      <span className="truncate mr-1">{block.label}</span>
                      <Pencil className="h-3 w-3 text-muted-foreground opacity-40 group-hover/label:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
                    </button>
                  </label>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onResetLabel();
                }}
                className="h-6 px-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-tight hover:bg-muted/50 rounded-md text-inherit shrink-0"
                aria-label={`Reset label for block ${block.label} to default`}
              >
                <span className="hidden xs:inline">Reset</span>
                <RefreshCw className="h-3 w-3 xs:ml-1 text-muted-foreground" />
              </Button>
              {showRemoveButton && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onRemoveBlock}
                  className="h-6 w-6 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="sr-only">Remove block: {block.label}</span>
                </Button>
              )}
            </div>
          </div>

          <div className="min-h-[50px] sm:min-h-[60px] w-full" style={{ whiteSpace: 'pre-line' }}>
            {isEditing ? (
              <textarea
                id={blockContentId}
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onBlur={handleContentBlur}
                onKeyDown={handleContentKeyDown}
                className={cn(
                  "w-full min-h-[60px] sm:min-h-[70px] p-2 sm:p-3 rounded-lg bg-muted/20 focus:outline-none focus:ring-2 transition-all text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary",
                  getTextAreaStyles(block.type)
                )}
                placeholder={block.placeholder}
                rows={1}
                autoFocus
                aria-label={`Edit content for ${block.label}`}
              />
            ) : (
              <button
                id={blockContentId}
                className={cn(
                  "w-full min-h-[50px] sm:min-h-[60px] p-2 sm:p-3 rounded-lg transition-all cursor-text text-sm font-medium border-2 border-transparent group-hover/block:border-muted-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex flex-col text-left",
                  content ? "bg-muted/5 text-foreground" : "bg-muted/20 text-muted-foreground/50 dark:text-muted-foreground/60 italic"
                )}
                onClick={() => setIsEditing(true)}
                aria-label={content ? `Edit content for ${block.label}` : `Add content to ${block.label}`}
              >
                <div className="flex-grow break-words">{content || block.placeholder}</div>
                <div className="self-end mt-1 opacity-20 group-hover/block:opacity-100 transition-opacity">
                  <Pencil className="h-3 sm:h-3.5 w-3 sm:w-3.5 text-muted-foreground/50" aria-hidden="true" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
