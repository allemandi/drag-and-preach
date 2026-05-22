"use client"
import { OutlineBlock } from "./outline-block"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Plus, RefreshCw } from "lucide-react"
import { useState, useEffect, useRef, useMemo, memo } from "react"
import { EditableField } from "@/components/ui/editable-field"
import type { Section } from "@/lib/types"
import { cn, getSectionStyles } from "@/lib/utils"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { DndContext, closestCorners, DragOverlay, type DragStartEvent, type DragEndEvent } from "@dnd-kit/core"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { createAnnouncements } from "@/lib/dnd-announcements"
import { useDndSensors } from "@/hooks/use-dnd-sensors"
import { BlockOverlay } from "@/components/ui/drag-overlays"

interface OutlineSectionProps {
  section: Section
  sectionIndex: number
  onContentChange: (sectionIndex: number, blockIndex: number, newContent: string) => void
  onLabelChange: (sectionIndex: number, blockIndex: number, newLabel: string) => void
  onResetLabel: (sectionIndex: number, blockIndex: number) => void
  onTitleChange: (sectionIndex: number, newTitle: string) => void
  onResetTitle: (sectionIndex: number) => void
  onRemoveSection: (sectionIndex: number) => void
  onAddBlock: (sectionIndex: number) => void
  onRemoveBlock: (sectionIndex: number, blockIndex: number) => void
  onBlockDragEnd: (event: DragEndEvent, sectionIndex: number) => void
  isNew?: boolean
  newBlockId?: string | null
  isDragging?: boolean
}

export const OutlineSection = memo(function OutlineSection({
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
  isDragging = false,
}: OutlineSectionProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isNew && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [isNew])

  const [activeBlockId, setActiveBlockId] = useState<string | null>(null)
  const sensors = useDndSensors()

  const announcements = useMemo(
    () => createAnnouncements("block", section.blocks, (b) => b.label),
    [section.blocks]
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveBlockId(event.active.id as string)
  }

  const handleDragEndWrapper = (event: DragEndEvent) => {
    setActiveBlockId(null)
    onBlockDragEnd(event, sectionIndex)
  }

  if (isDragging) {
    return (
      <div
        ref={cardRef}
        className={cn(
          "rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 min-h-[200px] w-full",
          getSectionStyles(section.type).split(' ').find(c => c.startsWith('border-'))?.replace('border-', 'border-') || ""
        )}
      />
    )
  }

  return (
    <Card
      ref={cardRef}
      className={cn("transition-all border rounded-2xl shadow-sm overflow-hidden outline-none", getSectionStyles(section.type))}
    >
      <CardHeader className={cn(
        "flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 pt-5 sm:pt-6 pr-3 sm:pr-8 gap-3",
        section.type === "body" ? "pl-9 sm:pl-10" : "pl-3 sm:pl-8"
      )}>
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <EditableField
            id={`section-${section.id}-title`}
            value={section.title}
            onSave={(newTitle) => onTitleChange(sectionIndex, newTitle)}
            label="section title"
            className="text-base sm:text-xl font-bold tracking-tight text-inherit py-1 min-w-0 w-full"
            inputClassName="h-8 sm:h-9 text-base sm:text-xl font-bold bg-background/50 border-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:border-primary w-full"
            autoFocus={isNew}
            renderValue={(val) => (
              <CardTitle className="text-inherit font-bold truncate">
                {val}
              </CardTitle>
            )}
          />
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button
            variant="ghost"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onResetTitle(sectionIndex);
            }}
            className="h-7 px-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider hover:bg-background/50 text-inherit flex items-center gap-1.5"
            aria-label={`Reset title for section ${section.title} to default`}
          >
            <span className="hidden sm:inline">Reset Title</span>
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <Button
            variant="outline"
            size="xs"
            onClick={() => onAddBlock(sectionIndex)}
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
              onClick={() => onRemoveSection(sectionIndex)}
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
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEndWrapper}
          onDragCancel={() => setActiveBlockId(null)}
          modifiers={[restrictToVerticalAxis]}
          accessibility={{ announcements }}
        >
          <SortableContext items={section.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
            {section.blocks.map((block, blockIndex) => (
              <OutlineBlock
                key={block.id}
                block={block}
                blockIndex={blockIndex}
                onContentChange={onContentChange}
                onLabelChange={onLabelChange}
                onResetLabel={onResetLabel}
                onRemoveBlock={onRemoveBlock}
                sectionIndex={sectionIndex}
                showRemoveButton={section.blocks.length > 1}
                isNew={block.id === newBlockId}
                isDragging={block.id === activeBlockId}
              />
            ))}
          </SortableContext>
          <DragOverlay adjustScale={true} dropAnimation={null}>
            {activeBlockId ? (
              <div className="w-full cursor-grabbing">
                <BlockOverlay block={section.blocks.find(b => b.id === activeBlockId)!} />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
        <div className="pt-2 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAddBlock(sectionIndex)}
            className="w-full py-6 border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/50 hover:bg-muted/50 transition-all group"
            aria-label={`Add another block to section ${section.title}`}
          >
            <Plus className="h-4 w-4 mr-2 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="text-muted-foreground font-medium group-hover:text-primary transition-colors">Add Block</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
