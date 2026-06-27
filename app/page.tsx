"use client"

import type React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import {
  DndContext,
  closestCorners,
  DragOverlay,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import { OutlineSection } from "@/components/outline-section"
import { SortableSection } from "@/components/sortable-section"
import { SectionOverlay } from "@/components/ui/drag-overlays"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Save, Plus, Moon, Sun, RefreshCw, Copy } from "lucide-react"
import { useTheme } from "next-themes"
import Footer from "@/components/footer"
import { ExportModal } from "@/components/export-modal"
import { BackupModal } from "@/components/backup-modal"
import JsonLd from "@/components/json-ld"
import { useSermonOutline } from "@/hooks/use-sermon-outline"
import { useDndSensors } from "@/hooks/use-dnd-sensors"
import { createAnnouncements } from "@/lib/dnd-announcements"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function SermonOutlinePlanner() {
  const [activeSectionId, setActiveId] = useState<string | null>(null)
  const {
    sections,
    bodySectionIds,
    showResetModal,
    setShowResetModal,
    handleBlockDragEnd,
    handleSectionDragEnd,
    handleContentChange,
    handleLabelChange,
    handleResetLabel,
    handleTitleChange,
    handleResetTitle,
    addBodySection,
    addBlockToSection,
    removeBlock,
    removeSection,
    confirmRemoveSection,
    cancelRemoveSection,
    sectionToDelete,
    handleExport,
    isExporting,
    isSaving,
    saveOutlineToLocalStorage,
    saveOutlineAsJson,
    handleResetAll,
    confirmResetAll,
    cancelResetAll,
    loadOutlineFromJson,
    copyToClipboard,
    newSectionId,
    newBlockId,
  } = useSermonOutline()

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useDndSensors()

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && !localStorage.getItem('theme')) {
      setTheme("dark")
    }
  }, [setTheme])

  const triggerFileInput = () => fileInputRef.current?.click()

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => loadOutlineFromJson(e.target?.result as string)
    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault()
        saveOutlineToLocalStorage()
      }
      // Ctrl+Alt+N to add new body section
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === "n") {
        e.preventDefault()
        addBodySection()
      }
      // Ctrl+Alt+R to reset
      if ((e.ctrlKey || e.metaKey) && e.altKey && e.key === "r") {
        e.preventDefault()
        handleResetAll()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [saveOutlineToLocalStorage, addBodySection, handleResetAll])

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  const announcements = useMemo(
    () => createAnnouncements("section", sections, (s) => s.title),
    [sections]
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEndWrapper = (event: DragEndEvent) => {
    setActiveId(null)
    handleSectionDragEnd(event)
  }

  if (!mounted) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <JsonLd />
      <span id="dnd-instructions" className="sr-only">
        To pick up a draggable item, press the space bar. While dragging, use the arrow keys to move the item. Press space again to drop the item in its new position, or press escape to cancel.
      </span>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-6xl pb-24">
        <header className="mb-8 sm:mb-10 space-y-6">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-pastel-blue/40 border-2 border-pastel-border-blue rounded-xl shadow-sm transition-transform group-hover:rotate-3">
                <ArrowUpDown className="h-6 w-6 text-pastel-text-blue" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Drag and Preach</h1>
                <h2 className="sr-only">Modern Sermon Planner & Outliner</h2>
                <p className="text-sm text-muted-foreground font-medium hidden sm:block">
                  Sleek, professional sermon organization for pastors.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={toggleTheme}
              className="rounded-full shadow-sm hover:scale-105 active:scale-95 transition-all bg-background/50"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </Button>
          </div>

          <nav className="sticky top-4 z-40 flex flex-col md:flex-row md:items-center justify-between gap-4 p-3 sm:p-4 bg-card/60 backdrop-blur-lg rounded-2xl border border-border shadow-md transition-all duration-300">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <Button
                onClick={saveOutlineToLocalStorage}
                variant="pastel"
                size="sm"
                disabled={isSaving}
                aria-busy={isSaving}
                title="Save to local storage (Ctrl+S)"
                aria-label={isSaving ? "Saving outline" : "Save outline to local storage (Ctrl+S)"}
              >
                {isSaving ? (
                  <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-1.5" />
                )}
                <span>{isSaving ? "Saving..." : "Save"}</span>
              </Button>
              <BackupModal onDownload={saveOutlineAsJson} onUpload={triggerFileInput} />
              <Button onClick={copyToClipboard} variant="pastel-amber" size="sm">
                <Copy className="h-4 w-4 mr-1.5" />
                <span>Copy</span>
              </Button>
              <ExportModal onExport={handleExport} isExporting={isExporting} />
            </div>

            <Button
              onClick={handleResetAll}
              variant="pastel-rose"
              size="sm"
              className="w-full md:w-auto"
              title="Reset the entire sermon outline (Ctrl+Alt+R)"
              aria-label="Reset the entire sermon outline (Ctrl+Alt+R)"
            >
              <RefreshCw className="h-4 w-4 mr-1.5" />
              <span>Reset All</span>
            </Button>
            <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".json" className="hidden" />
          </nav>
        </header>

        <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
          <DialogContent className="rounded-2xl border border-pastel-border-rose shadow-xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Reset Workspace?</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-6">
              <p className="text-center text-muted-foreground text-sm font-medium">
                This will clear your current outline. Are you sure you want to proceed?
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button variant="outline" onClick={cancelResetAll} className="flex-1 order-2 sm:order-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmResetAll} className="flex-1 order-1 sm:order-2">
                  Yes, Reset
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={sectionToDelete !== null} onOpenChange={(open) => !open && cancelRemoveSection()}>
          <DialogContent className="rounded-2xl border border-pastel-border-rose shadow-xl sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Remove Section?</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-6">
              <p className="text-center text-muted-foreground text-sm font-medium">
                Are you sure you want to remove "{sectionToDelete !== null ? sections[sectionToDelete]?.title : ""}"? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button variant="outline" onClick={cancelRemoveSection} className="flex-1 order-2 sm:order-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmRemoveSection} className="flex-1 order-1 sm:order-2">
                  Yes, Remove
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <main className="space-y-12">
          {/* Introduction Section (Not draggable) */}
          {sections.length > 0 && sections[0].type === "intro" && (
            <OutlineSection
              section={sections[0]}
              sectionIndex={0}
              onContentChange={handleContentChange}
              onLabelChange={handleLabelChange}
              onResetLabel={handleResetLabel}
              onTitleChange={handleTitleChange}
              onResetTitle={handleResetTitle}
              onRemoveSection={removeSection}
              onAddBlock={addBlockToSection}
              onRemoveBlock={removeBlock}
              onBlockDragEnd={handleBlockDragEnd}
              newBlockId={newBlockId}
            />
          )}

          {/* Draggable Body Sections */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEndWrapper}
            onDragCancel={() => setActiveId(null)}
            modifiers={[restrictToVerticalAxis]}
            accessibility={{ announcements }}
          >
            <SortableContext items={bodySectionIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-8">
                {sections.filter(s => s.type === "body").length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-muted-foreground/20 rounded-2xl bg-muted/5">
                    <p className="text-muted-foreground font-medium">No body sections yet.</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">Click the button below to add your first point.</p>
                  </div>
                ) : (
                  sections.map((section, index) => {
                    if (section.type !== "body") return null;
                    return (
                      <SortableSection key={section.id} id={section.id} title={section.title}>
                        <OutlineSection
                          section={section}
                          sectionIndex={index}
                          onContentChange={handleContentChange}
                          onLabelChange={handleLabelChange}
                          onResetLabel={handleResetLabel}
                          onTitleChange={handleTitleChange}
                          onResetTitle={handleResetTitle}
                          onRemoveSection={removeSection}
                          onAddBlock={addBlockToSection}
                          onRemoveBlock={removeBlock}
                          onBlockDragEnd={handleBlockDragEnd}
                          isNew={section.id === newSectionId}
                          newBlockId={newBlockId}
                          isDragging={section.id === activeSectionId}
                        />
                      </SortableSection>
                    );
                  })
                )}
              </div>
            </SortableContext>
            <DragOverlay adjustScale={true} dropAnimation={null}>
              {activeSectionId ? (
                <div className="w-full cursor-grabbing">
                  <SectionOverlay section={sections.find(s => s.id === activeSectionId)!} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>

          <div className="flex justify-center py-6">
            <Button
              onClick={addBodySection}
              size="xl"
              variant="pastel-green"
              className="flex items-center gap-2 group shadow-md"
              title="Add a new body section (Ctrl+Alt+N)"
              aria-label="Add a new body section (Ctrl+Alt+N)"
            >
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              <span className="text-lg font-bold">Add New Body Section</span>
            </Button>
          </div>

          {/* Conclusion Section (Not draggable) */}
          {sections.length > 0 && sections[sections.length - 1].type === "conclusion" && (
            <OutlineSection
              section={sections[sections.length - 1]}
              sectionIndex={sections.length - 1}
              onContentChange={handleContentChange}
              onLabelChange={handleLabelChange}
              onResetLabel={handleResetLabel}
              onTitleChange={handleTitleChange}
              onResetTitle={handleResetTitle}
              onRemoveSection={removeSection}
              onAddBlock={addBlockToSection}
              onRemoveBlock={removeBlock}
              onBlockDragEnd={handleBlockDragEnd}
              newBlockId={newBlockId}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}
