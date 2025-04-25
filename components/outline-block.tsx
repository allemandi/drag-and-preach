"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, X, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { OutlineBlock as OutlineBlockType } from "@/lib/types"

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

    // Update content directly without autosave
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

  const getBlockColor = (type: string) => {
    switch (type) {
      case "intro":
        return "bg-blue-500/10 hover:bg-blue-500/20"
      case "body":
        return "bg-green-500/10 hover:bg-green-500/20"
      case "conclusion":
        return "bg-amber-500/10 hover:bg-amber-500/20"
      default:
        return "bg-slate-500/10 hover:bg-slate-500/20"
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border p-3 ${isDragging ? "z-10" : ""} transition-colors backdrop-blur-sm`}
    >
      <div className="flex items-start gap-3">
        <div
          {...attributes}
          {...listeners}
          className="flex-shrink-0 cursor-grab mt-1 p-1 rounded hover:bg-muted"
          data-drag-handle
          tabIndex={0}
          aria-label="Drag to reorder block"
          role="button"
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <div className="flex-grow space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isEditingLabel ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={labelValue}
                    onChange={handleLabelChange}
                    onBlur={handleLabelBlur}
                    onKeyDown={handleLabelKeyDown}
                    className="max-w-[200px] h-7 text-sm font-medium"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onResetLabel}
                    className="h-6 w-6 rounded-full hover:bg-muted"
                    title="Reset label to default"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span className="sr-only">Reset label</span>
                  </Button>
                </div>
              ) : (
                <label
                  className="text-sm font-medium text-foreground cursor-pointer"
                  onClick={() => setIsEditingLabel(true)}
                >
                  {block.label}
                </label>
              )}
            </div>

            <div className="flex items-center gap-2">
              {showRemoveButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onRemoveBlock}
                  className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive"
                  title="Remove block"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remove block</span>
                </Button>
              )}
            </div>
          </div>

          <div className="min-h-[60px] w-full" onClick={() => setIsEditing(true)}>
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onBlur={() => setIsEditing(false)}
                className={`w-full min-h-[60px] p-2 rounded-lg ${getBlockColor(block.type)} focus:outline-none focus:ring-2 focus:ring-primary`}
                placeholder={block.placeholder}
                rows={1}
              />
            ) : (
              <div
                className={`w-full min-h-[60px] p-2 rounded-lg ${content ? getBlockColor(block.type) : "bg-muted/50 hover:bg-muted"}`}
              >
                {content || <span className="text-muted-foreground italic">{block.placeholder}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
