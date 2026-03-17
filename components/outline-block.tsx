"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X, RefreshCw, Pencil } from "lucide-react"
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

  const handleLabelDisplayKeyDown = (e: React.KeyboardEvent<HTMLLabelElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setIsEditingLabel(true)
    }
  }

  const handleContentDisplayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      setIsEditing(true)
    }
  }

  const getBlockStyles = (type: string) => {
    switch (type) {
      case "intro":
        return "bg-background border-pastel-border-blue/50 hover:border-pastel-border-blue text-pastel-text-blue"
      case "body":
        return "bg-background border-pastel-border-green/50 hover:border-pastel-border-green text-pastel-text-green"
      case "conclusion":
        return "bg-background border-pastel-border-amber/50 hover:border-pastel-border-amber text-pastel-text-amber"
      default:
        return "bg-background border-pastel-border-purple/50 hover:border-pastel-border-purple text-pastel-text-purple"
    }
  }

  const getTextAreaStyles = (type: string) => {
    switch (type) {
      case "intro":
        return "focus:ring-pastel-border-blue/40 border-pastel-border-blue/20"
      case "body":
        return "focus:ring-pastel-border-green/40 border-pastel-border-green/20"
      case "conclusion":
        return "focus:ring-pastel-border-amber/40 border-pastel-border-amber/20"
      default:
        return "focus:ring-pastel-border-purple/40 border-pastel-border-purple/20"
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border p-4 transition-all duration-200 shadow-sm",
        isDragging ? "z-10 shadow-lg scale-[1.01] ring-2 ring-primary/5" : "",
        getBlockStyles(block.type)
      )}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab mt-1 p-1.5 rounded-md hover:bg-muted transition-colors bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          data-drag-handle
          tabIndex={0}
          aria-label={`Drag to reorder block: ${block.label}`}
          aria-roledescription="drag handle"
          role="button"
          style={{ touchAction: 'none' }}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="flex-grow space-y-3 group/block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="relative min-w-[120px] flex items-center group/label">
                {isEditingLabel ? (
                  <Input
                    value={labelValue}
                    onChange={handleLabelChange}
                    onBlur={handleLabelBlur}
                    onKeyDown={handleLabelKeyDown}
                    className="h-7 text-[10px] font-bold rounded-md bg-background border-2 w-full focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
                    autoFocus
                    aria-label="Edit label"
                  />
                ) : (
                  <label
                    className="text-[10px] font-bold text-inherit opacity-70 uppercase tracking-widest cursor-pointer hover:opacity-100 transition-all px-1.5 py-0.5 bg-muted/30 rounded w-full border-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:bg-muted/50 flex items-center justify-between"
                    onClick={() => setIsEditingLabel(true)}
                    onKeyDown={handleLabelDisplayKeyDown}
                    tabIndex={0}
                    role="button"
                    aria-label={`Edit label: ${block.label}`}
                  >
                    <span>{block.label}</span>
                    <Pencil className="h-2.5 w-2.5 opacity-0 group-hover/label:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
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
                className="h-6 px-1.5 text-[9px] font-bold uppercase tracking-tight hover:bg-muted/50 rounded-md text-inherit"
              >
                <span>Reset</span>
                <RefreshCw className="h-2.5 w-2.5 ml-1" />
              </Button>
              {showRemoveButton && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onRemoveBlock}
                  className="h-6 w-6 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                  <span className="sr-only">Remove block</span>
                </Button>
              )}
            </div>
          </div>

          <div className="min-h-[60px] w-full" style={{ whiteSpace: 'pre-line' }}>
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onBlur={() => setIsEditing(false)}
                className={cn(
                  "w-full min-h-[70px] p-3 rounded-lg bg-muted/20 focus:outline-none focus:ring-2 transition-all text-sm font-medium focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary",
                  getTextAreaStyles(block.type)
                )}
                placeholder={block.placeholder}
                rows={1}
                autoFocus
                aria-label="Edit block content"
              />
            ) : (
              <div
                className={cn(
                  "w-full min-h-[60px] p-3 rounded-lg transition-all cursor-text text-sm font-medium border-2 border-transparent group-hover/block:border-muted-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary flex flex-col",
                  content ? "bg-muted/5 text-foreground" : "bg-muted/20 text-muted-foreground/50 dark:text-muted-foreground/60 italic"
                )}
                onClick={() => setIsEditing(true)}
                onKeyDown={handleContentDisplayKeyDown}
                tabIndex={0}
                role="button"
                aria-label={content ? "Edit content" : "Add content"}
              >
                <div className="flex-grow">{content || block.placeholder}</div>
                <div className="self-end mt-1 opacity-0 group-hover/block:opacity-100 transition-opacity">
                  <Pencil className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
