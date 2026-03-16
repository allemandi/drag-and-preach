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
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 selection:bg-primary/20">
      <div className="container mx-auto px-4 py-12 max-w-7xl pb-32">
        <header className="mb-16 space-y-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-5 group">
              <div className="p-4 bg-pastel-blue border-2 border-pastel-border-blue rounded-3xl shadow-sm transition-transform group-hover:rotate-6">
                <ArrowUpDown className="h-10 w-10 text-foreground" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-balance">Drag and Preach</h1>
                <p className="text-xl text-muted-foreground font-semibold tracking-tight">
                  Sleek, professional sermon organization.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full h-16 w-16 border-2 shadow-sm hover:scale-110 active:scale-90 transition-all bg-background/50 backdrop-blur-sm"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon className="h-7 w-7" /> : <Sun className="h-7 w-7" />}
            </Button>
          </div>

          <nav className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 bg-card/60 backdrop-blur-xl rounded-[2rem] border-2 border-border shadow-md">
            <div className="flex flex-wrap items-center gap-4">
              <Button onClick={saveOutlineToLocalStorage} variant="pastel" className="h-12 px-8">
                <Save className="h-5 w-5 mr-2" />
                <span>Save</span>
              </Button>
              <BackupModal onDownload={saveOutlineAsJson} onUpload={triggerFileInput} />
              <ExportModal onExport={handleExport} />
            </div>

            <Button onClick={handleResetAll} variant="pastel-rose" className="h-12 px-8">
              <RefreshCw className="h-5 w-5 mr-2" />
              <span>Reset All</span>
            </Button>
            <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".json" className="hidden" />
          </nav>
        </header>

        <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
          <DialogContent className="rounded-3xl border-2 border-pastel-border-rose shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-center tracking-tight">Reset Workspace?</DialogTitle>
            </DialogHeader>
            <div className="mt-8 space-y-10">
              <p className="text-center text-muted-foreground text-xl font-medium">
                This will clear your current outline. Are you sure you want to proceed?
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button variant="outline" onClick={cancelResetAll} className="h-14 px-10 text-lg font-bold order-2 sm:order-1 rounded-2xl">
                  Cancel
                </Button>
                <Button variant="destructive" onClick={confirmResetAll} className="h-14 px-10 text-lg font-bold order-1 sm:order-2 rounded-2xl">
                  Yes, Reset Everything
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <main className="space-y-16">
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
              <div className="space-y-10">
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

          <div className="flex justify-center py-12">
            <Button
              onClick={addBodySection}
              size="xl"
              variant="pastel-green"
              className="flex items-center gap-5 px-20 py-10 rounded-[2rem] transition-all hover:scale-105 hover:shadow-2xl active:scale-95 group"
            >
              <Plus className="h-10 w-10 transition-transform group-hover:rotate-90" />
              <span className="text-2xl font-black tracking-tight">Add New Body Section</span>
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
