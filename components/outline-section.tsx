"use client"
import { OutlineBlock } from "./outline-block"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, RefreshCw, Pencil } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import type { Section } from "@/lib/types"
import { cn, getSectionStyles } from "@/lib/utils"

interface OutlineSectionProps {
  section: Section
  sectionIndex: number
  onContentChange: (sectionIndex: number, blockIndex: number, newContent: string) => void
  onLabelChange: (sectionIndex: number, blockIndex: number, newLabel: string) => void
  onResetLabel: (sectionIndex: number, blockIndex: number) => void
  onTitleChange: (sectionIndex: number, newTitle: string) => void
  onResetTitle: (sectionIndex: number) => void
  onRemoveSection: () => void
  onAddBlock: () => void
  onRemoveBlock: (blockIndex: number) => void
  onClearBlockContent: (blockIndex: number) => void
  isNew?: boolean
}

export function OutlineSection({
  section,
  sectionIndex,
  onContentChange,
  onLabelChange,
  onResetLabel,
  onTitleChange,
  onResetTitle,
  onRemoveSection,
  onAddBlock,
  onRemoveBlock,
  onClearBlockContent,
  isNew = false,
}: OutlineSectionProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(section.title)
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setTitleValue(section.title)
  }, [section.title])

  useEffect(() => {
    if (isNew && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isNew])


  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitleValue(e.target.value)
  }
  const handleTitleBlur = () => {
    onTitleChange(sectionIndex, titleValue)
    setIsEditingTitle(false)
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleTitleBlur()
    }
  }

  return (
    <Card
      ref={cardRef}
      className={cn("transition-all border rounded-2xl shadow-sm overflow-hidden outline-none", getSectionStyles(section.type))}
      tabIndex={-1}
    >
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 pt-6 px-4 sm:px-8 gap-3">
        <div className="flex items-center gap-3 min-w-[200px] group/title">
          {isEditingTitle ? (
            <Input
              value={titleValue}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="h-9 text-lg sm:text-xl font-bold bg-background/50 rounded-md border-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary"
              autoFocus
              aria-label={`Edit section title for ${section.title}`}
            />
          ) : (
            <button
              className="text-lg sm:text-xl font-bold cursor-pointer hover:opacity-70 transition-all tracking-tight text-inherit py-1 border-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-md flex items-center gap-2 w-full text-left"
              onClick={() => setIsEditingTitle(true)}
              aria-label={`Edit section title: ${section.title}`}
            >
              <CardTitle className="text-inherit font-bold">
                {section.title}
              </CardTitle>
              <Pencil className="h-4 w-4 opacity-20 group-hover/title:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onResetTitle(sectionIndex);
            }}
            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider hover:bg-background/50 text-inherit"
            aria-label={`Reset title for section ${section.title} to default`}
          >
            <span className="hidden sm:inline">Reset Title</span>
            <RefreshCw className="h-3 w-3 sm:ml-1.5" />
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={onAddBlock}
            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider bg-background/50 hover:bg-background border"
            aria-label={`Add a new block to section ${section.title}`}
          >
            <span>Add Block</span>
            <Plus className="h-3 w-3 ml-1.5" />
          </Button>
          {section.type === "body" && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onRemoveSection}
              className="h-7 w-7 rounded-md hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              <span className="sr-only">Remove section: {section.title}</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pb-6 px-4 sm:px-8">
        {section.blocks.map((block, blockIndex) => (
          <OutlineBlock
            key={block.id}
            block={block}
            onChange={(newContent) => onContentChange(sectionIndex, blockIndex, newContent)}
            onLabelChange={(newLabel) => onLabelChange(sectionIndex, blockIndex, newLabel)}
            onResetLabel={() => onResetLabel(sectionIndex, blockIndex)}
            onRemoveBlock={() => onRemoveBlock(blockIndex)}
            onClearContent={() => onClearBlockContent(blockIndex)}
            showRemoveButton={section.blocks.length > 1}
          />
        ))}
      </CardContent>
    </Card>
  )
}
