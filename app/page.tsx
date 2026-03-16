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
      <div className="container mx-auto px-4 py-8 max-w-5xl pb-32">
        <header className="mb-12 space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4 group">
              <div className="p-3 bg-pastel-blue border-2 border-pastel-border-blue rounded-2xl shadow-sm transition-transform group-hover:rotate-6">
                <ArrowUpDown className="h-8 w-8 text-foreground" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black tracking-tight text-balance">Drag and Preach</h1>
                <p className="text-lg text-muted-foreground font-medium">
                  Sleek, professional sermon organization.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-14 w-14 border-2 shadow-sm hover:scale-110 active:scale-90 transition-all"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
            </Button>
          </div>

          <nav className="grid grid-cols-1 sm:flex sm:items-center justify-between gap-4 p-5 bg-card/50 backdrop-blur-md rounded-3xl border-2 border-border shadow-sm">
            <div className="flex flex-wrap gap-3">
              <Button onClick={saveOutlineToLocalStorage} variant="pastel" className="flex-1 sm:flex-none h-11 px-6">
                <Save className="h-4 w-4 mr-2" />
                <span>Save</span>
              </Button>
              <BackupModal onDownload={saveOutlineAsJson} onUpload={triggerFileInput} />
              <ExportModal onExport={handleExport} />
            </div>

            <Button onClick={handleResetAll} variant="pastel-rose" className="h-11 px-6">
              <RefreshCw className="h-4 w-4 mr-2" />
              <span>Reset All</span>
            </Button>
            <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".json" className="hidden" />
          </nav>
        </header>

        <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
          <DialogContent className="rounded-2xl border-2 border-pastel-border-rose">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">Reset Workspace?</DialogTitle>
            </DialogHeader>
            <div className="mt-6 space-y-8">
              <p className="text-center text-muted-foreground text-lg">
                This will clear your current outline. Are you sure you want to proceed?
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button variant="outline" onClick={cancelResetAll} className="h-12 px-8 text-base order-2 sm:order-1">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmResetAll} className="h-12 px-8 text-base order-1 sm:order-2">
                  Yes, Reset Everything
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
                  isDraggable={false}
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
                              isDraggable={false}
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

          <div className="flex justify-center py-8">
            <Button
              onClick={addBodySection}
              size="xl"
              variant="pastel-green"
              className="flex items-center gap-4 px-16 py-8 rounded-2xl transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <Plus className="h-8 w-8" />
              <span className="text-xl font-bold">Add New Body Section</span>
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
                  isDraggable={false}
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
