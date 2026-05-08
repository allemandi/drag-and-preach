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
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import { createAnnouncements } from "@/lib/dnd-announcements"
import { useDndSensors } from "@/hooks/use-dnd-sensors"

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
  onBlockDragEnd: (event: DragEndEvent) => void
  isNew?: boolean
  newBlockId?: string | null
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
  onBlockDragEnd,
  isNew = false,
  newBlockId = null,
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
    } else if (e.key === "Escape") {
      setTitleValue(section.title)
      setIsEditingTitle(false)
    }
  }

  const sensors = useDndSensors()

  const announcements = createAnnouncements("block", section.blocks, (b) => b.label)

  return (
    <Card
      ref={cardRef}
      className={cn("transition-all border rounded-2xl shadow-sm overflow-hidden outline-none", getSectionStyles(section.type))}
    >
      <CardHeader className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 pt-5 sm:pt-6 pr-3 sm:pr-8 gap-3",
        section.type === "body" ? "pl-9 sm:pl-10" : "pl-3 sm:pl-8"
      )}>
        <div className="flex items-center gap-2 min-w-0 flex-1 group/title">
          {isEditingTitle ? (
            <Input
              value={titleValue}
              onChange={handleTitleChange}
              onBlur={handleTitleBlur}
              onKeyDown={handleTitleKeyDown}
              className="h-8 sm:h-9 text-base sm:text-xl font-bold bg-background/50 rounded-md border-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary w-full"
              autoFocus
              aria-label={`Edit section title for ${section.title}`}
            />
          ) : (
            <button
              className="text-base sm:text-xl font-bold cursor-pointer hover:opacity-70 transition-all tracking-tight text-inherit py-1 border-2 border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:rounded-md flex items-center gap-2 min-w-0 text-left overflow-hidden"
              onClick={() => setIsEditingTitle(true)}
              aria-label={`Edit section title: ${section.title}`}
            >
              <CardTitle className="text-inherit font-bold truncate">
                {section.title}
              </CardTitle>
              <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4 opacity-20 group-hover/title:opacity-100 transition-opacity shrink-0" aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onResetTitle(sectionIndex);
            }}
            className="h-7 px-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-background/50 text-inherit"
            aria-label={`Reset title for section ${section.title} to default`}
          >
            <span className="hidden sm:inline">Reset Title</span>
            <RefreshCw className="h-3.5 w-3.5 sm:ml-1.5 text-muted-foreground" />
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={onAddBlock}
            className="h-7 px-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-background/50 hover:bg-background border"
            aria-label={`Add a new block to section ${section.title}`}
          >
            <span className="hidden xs:inline">Add Block</span>
            <Plus className="h-3.5 w-3.5 xs:ml-1.5 text-muted-foreground" />
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
      <CardContent className="space-y-4 pb-5 sm:pb-6 px-3 sm:px-8">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onBlockDragEnd}
          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          accessibility={{ announcements }}
        >
          <SortableContext items={section.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {section.blocks.map((block, blockIndex) => (
              <OutlineBlock
                key={block.id}
                block={block}
                onChange={(newContent) => onContentChange(sectionIndex, blockIndex, newContent)}
                onLabelChange={(newLabel) => onLabelChange(sectionIndex, blockIndex, newLabel)}
                onResetLabel={() => onResetLabel(sectionIndex, blockIndex)}
                onRemoveBlock={() => onRemoveBlock(blockIndex)}
                showRemoveButton={section.blocks.length > 1}
                isNew={block.id === newBlockId}
              />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  )
}
