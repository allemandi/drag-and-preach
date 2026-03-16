"use client"
import { OutlineBlock } from "./outline-block"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import type { Section } from "@/lib/types"
import { cn } from "@/lib/utils"

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
  isDraggable: boolean
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
}: OutlineSectionProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState(section.title)

  const getSectionStyles = (type: string) => {
    switch (type) {
      case "intro":
        return "border-pastel-border-blue bg-pastel-blue/10"
      case "body":
        return "border-pastel-border-green bg-pastel-green/10"
      case "conclusion":
        return "border-pastel-border-amber bg-pastel-amber/10"
      default:
        return "border-pastel-border-purple bg-pastel-purple/10"
    }
  }

  useEffect(() => {
    setTitleValue(section.title)
  }, [section.title])


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
    <Card className={cn("transition-all border rounded-2xl shadow-sm overflow-hidden", getSectionStyles(section.type))}>
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 pt-6 px-4 sm:px-8 gap-3">
        <div className="flex items-center gap-3">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={titleValue}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="max-w-[240px] h-8 text-lg font-bold bg-background/50 rounded-md"
                autoFocus
              />
            </div>
          ) : (
            <CardTitle
              className="text-lg sm:text-xl font-bold cursor-pointer hover:opacity-70 transition-opacity tracking-tight"
              onClick={() => setIsEditingTitle(true)}
            >
              {section.title}
            </CardTitle>
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
            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider hover:bg-background/50"
          >
            <span className="hidden sm:inline">Reset Title</span>
            <RefreshCw className="h-3 w-3 sm:ml-1.5" />
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={onAddBlock}
            className="h-7 px-2 text-[10px] font-bold uppercase tracking-wider bg-background/50 hover:bg-background border"
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
              <X className="h-4 w-4" />
              <span className="sr-only">Remove section</span>
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
            showRemoveButton={section.blocks.length > 1}
          />
        ))}
      </CardContent>
    </Card>
  )
}
