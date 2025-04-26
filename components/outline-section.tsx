"use client"
import { OutlineBlock } from "./outline-block"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import type { Section } from "@/lib/types"

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


  const getSectionColor = (type: string) => {
    switch (type) {
      case "intro":
        return "border-blue-500/20"
      case "body":
        return "border-green-500/20"
      case "conclusion":
        return "border-amber-500/20"
      default:
        return "border-slate-500/20"
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

  const handleResetTitleClick = () => {
    onResetTitle(sectionIndex);
    setIsEditingTitle(false);
  }

  return (
    <Card className={`shadow-lg border-2 ${getSectionColor(section.type)} backdrop-blur-sm bg-card/80`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pl-12">
        <div className="flex items-center gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <Input
                value={titleValue}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                className="max-w-[200px] h-8 text-xl font-bold"
                autoFocus
              />
            </div>
          ) : (
            <CardTitle
              className="text-xl font-bold cursor-pointer"
              onClick={() => setIsEditingTitle(true)}
            >
              {section.title}
            </CardTitle>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onResetTitle(sectionIndex);
            }}
            className="h-8 px-2 sm:px-3 text-xs hover:bg-muted"
          >
            <span className="hidden sm:inline">Reset Title</span>
            <RefreshCw className="h-3.5 w-3.5 sm:ml-1" />
          </Button>
          <Button
    variant="outline"
    size="sm"
    onClick={onAddBlock}
    className="h-8 px-2 sm:px-3 text-xs hover:bg-muted/50"
  >
    <span className="hidden sm:inline">Add Block</span>
    <Plus className="h-3.5 w-3.5 sm:ml-1" />
          </Button>
          {section.type === "body" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemoveSection}
              className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove section</span>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
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
