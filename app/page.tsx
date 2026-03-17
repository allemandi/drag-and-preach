"use client"

import type React from "react"
import { useState, useMemo, useEffect, useRef } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core"
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import { OutlineSection } from "@/components/outline-section"
import { SortableSection } from "@/components/sortable-section"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Save, Plus, Moon, Sun, RefreshCw } from "lucide-react"
import { useTheme } from "next-themes"
import Footer from "@/components/footer"
import { ExportModal } from "@/components/export-modal"
import { BackupModal } from "@/components/backup-modal"
import { useSermonOutline } from "@/hooks/use-sermon-outline"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export default function SermonOutlinePlanner() {
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
    handleExport,
    saveOutlineToLocalStorage,
    saveOutlineAsJson,
    handleResetAll,
    confirmResetAll,
    cancelResetAll,
    loadOutlineFromJson,
  } = useSermonOutline()

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 0, distance: 0 } }),
    useSensor(PointerSensor, { activationConstraint: { delay: 0, distance: 0 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

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

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark")

  if (!mounted) return <div className="min-h-screen bg-background" />

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-6xl pb-24">
        <header className="mb-10 space-y-6">
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3 group">
              <div className="p-2 bg-pastel-blue/40 border-2 border-pastel-border-blue rounded-xl shadow-sm transition-transform group-hover:rotate-3">
                <ArrowUpDown className="h-6 w-6 text-pastel-text-blue" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Drag and Preach</h1>
                <p className="text-sm text-muted-foreground font-medium hidden sm:block">
                  Sleek, professional sermon organization.
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

          <nav className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-card/40 backdrop-blur-md rounded-2xl border border-border shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={saveOutlineToLocalStorage} variant="pastel" size="sm">
                <Save className="h-4 w-4 mr-1.5" />
                <span>Save</span>
              </Button>
              <BackupModal onDownload={saveOutlineAsJson} onUpload={triggerFileInput} />
              <ExportModal onExport={handleExport} />
            </div>

            <Button onClick={handleResetAll} variant="pastel-rose" size="sm">
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

        <main className="space-y-12">
          {/* Introduction Section (Not draggable) */}
          {sections.length > 0 && sections[0].type === "intro" && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleBlockDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext items={sections[0].blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                <OutlineSection
                  section={sections[0]}
                  sectionIndex={0}
                  onContentChange={handleContentChange}
                  onLabelChange={handleLabelChange}
                  onResetLabel={(bi) => handleResetLabel(0, bi)}
                  onTitleChange={handleTitleChange}
                  onResetTitle={handleResetTitle}
                  onRemoveSection={() => removeSection(0)}
                  onAddBlock={() => addBlockToSection(0)}
                  onRemoveBlock={bi => removeBlock(0, bi)}
                />
              </SortableContext>
            </DndContext>
          )}

          {/* Draggable Body Sections */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
            <SortableContext items={bodySectionIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-8">
                {sections.map((section, index) => {
                  if (section.type !== "body") return null;
                  return (
                    <div key={section.id}>
                      <SortableSection id={section.id}>
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleBlockDragEnd}
                          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                        >
                          <SortableContext items={section.blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                            <OutlineSection
                              section={section}
                              sectionIndex={index}
                              onContentChange={handleContentChange}
                              onLabelChange={handleLabelChange}
                              onResetLabel={(bi) => handleResetLabel(index, bi)}
                              onTitleChange={handleTitleChange}
                              onResetTitle={handleResetTitle}
                              onRemoveSection={() => removeSection(index)}
                              onAddBlock={() => addBlockToSection(index)}
                              onRemoveBlock={bi => removeBlock(index, bi)}
                            />
                          </SortableContext>
                        </DndContext>
                      </SortableSection>
                    </div>
                  );
                })}
              </div>
            </SortableContext>
          </DndContext>

          <div className="flex justify-center py-6">
            <Button
              onClick={addBodySection}
              size="xl"
              variant="pastel-green"
              className="flex items-center gap-2 group shadow-md"
            >
              <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
              <span className="text-lg font-bold">Add New Body Section</span>
            </Button>
          </div>

          {/* Conclusion Section (Not draggable) */}
          {sections.length > 0 && sections[sections.length - 1].type === "conclusion" && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleBlockDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext items={sections[sections.length - 1].blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                <OutlineSection
                  section={sections[sections.length - 1]}
                  sectionIndex={sections.length - 1}
                  onContentChange={handleContentChange}
                  onLabelChange={handleLabelChange}
                  onResetLabel={(bi) => handleResetLabel(sections.length - 1, bi)}
                  onTitleChange={handleTitleChange}
                  onResetTitle={handleResetTitle}
                  onRemoveSection={() => removeSection(sections.length - 1)}
                  onAddBlock={() => addBlockToSection(sections.length - 1)}
                  onRemoveBlock={bi => removeBlock(sections.length - 1, bi)}
                />
              </SortableContext>
            </DndContext>
          )}
        </main>

        <Footer />
      </div>
    </div>
  )
}
