import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { GripVertical } from "lucide-react"
import { cn, getSectionStyles, getBlockStyles } from "@/lib/utils"
import type { Section, OutlineBlock as OutlineBlockType } from "@/lib/types"

export function SectionOverlay({ section }: { section: Section }) {
  return (
    <Card className={cn("w-full opacity-90 shadow-2xl border-2 pointer-events-none", getSectionStyles(section.type))}>
      <CardHeader className={cn(
        "flex flex-row items-center pb-4 pt-5 pr-3 gap-3",
        section.type === "body" ? "pl-9" : "pl-3"
      )}>
        <CardTitle className="text-inherit font-bold truncate">
          {section.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-5 px-3">
        {section.blocks.slice(0, 3).map((block) => (
          <BlockOverlay key={block.id} block={block} />
        ))}
        {section.blocks.length > 3 && (
          <div className="text-center text-xs opacity-50 font-bold">
            + {section.blocks.length - 3} more blocks
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function BlockOverlay({ block }: { block: OutlineBlockType }) {
  return (
    <div className={cn("rounded-xl border p-2.5 sm:p-4 transition-all duration-200 shadow-lg bg-card pointer-events-none flex items-start gap-2 sm:gap-3", getBlockStyles(block.type))}>
      <GripVertical className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground mt-1 opacity-50" />
      <div className="flex-grow space-y-2 min-w-0">
        <div className="text-[10px] sm:text-xs font-bold opacity-70 uppercase tracking-widest truncate">
          {block.label}
        </div>
        <div className="text-sm font-medium line-clamp-3 opacity-80">
          {block.content || block.placeholder}
        </div>
      </div>
    </div>
  )
}
