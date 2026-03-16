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

  const touchSensorConfig = useMemo(() => ({
    activationConstraint: {
      delay: 0,
      distance: 0,
    },
  }), [])

  const pointerSensorConfig = useMemo(() => ({
    activationConstraint: {
      delay: 0,
      distance: 0,
    },
  }), [])

  const keyboardSensorConfig = useMemo(() => ({
    coordinateGetter: sortableKeyboardCoordinates,
  }), [])

  const touchSensor = useSensor(TouchSensor, touchSensorConfig)
  const pointerSensor = useSensor(PointerSensor, pointerSensorConfig)
  const keyboardSensor = useSensor(KeyboardSensor, keyboardSensorConfig)

  const sectionSensors = useSensors(touchSensor, pointerSensor, keyboardSensor)
  const blockSensors = useSensors(touchSensor, pointerSensor, keyboardSensor)

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && !localStorage.getItem('theme')) {
      setTheme("dark")
    }
  }, [setTheme])

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      loadOutlineFromJson(content)
    }
    reader.readAsText(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl pb-24 opacity-0" />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl pb-24 transition-opacity duration-300">
      <header className="mb-10 pb-8 border-b-2 border-dashed border-muted-foreground/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pastel-blue border-2 border-pastel-border-blue rounded-xl shadow-sm">
                <ArrowUpDown className="h-8 w-8 text-foreground" />
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight">Drag and Preach</h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl">
              A sleek, professional tool to organize, structure, and export your sermons with ease.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full h-12 w-12 border-2 shadow-sm transition-transform hover:rotate-12"
          >
            {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-muted/30 rounded-2xl border-2 border-border/50">
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Button onClick={saveOutlineToLocalStorage} variant="pastel" className="flex-1 sm:flex-none">
              <Save className="h-4 w-4 sm:mr-2" />
              <span>Save</span>
            </Button>
            <BackupModal
              onDownload={saveOutlineAsJson}
              onUpload={triggerFileInput}
            />
            <ExportModal onExport={handleExport} />
          </div>

          <Button onClick={handleResetAll} variant="pastel-rose" className="w-full sm:w-auto">
            <RefreshCw className="h-4 w-4 sm:mr-2" />
            <span>Reset All</span>
          </Button>
          <input type="file" ref={fileInputRef} onChange={onFileChange} accept=".json" className="hidden" />
        </div>
      </header>

      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent className="rounded-xl border-2 border-pastel-border-rose">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Reset All Sections</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-base text-muted-foreground mb-6">
              <strong className="text-foreground">Warning:</strong> Your current progress will be lost! Are you sure you want to reset all sections to their default state?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelResetAll} className="px-6">
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmResetAll} className="px-6">
                Yes, Reset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-10">
        {/* Introduction Section */}
        {sections.length > 0 && sections[0].type === "intro" && (
          <DndContext
            sensors={blockSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleBlockDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext items={sections[0].blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
              <OutlineSection
                section={sections[0]}
                sectionIndex={0}
                onContentChange={handleContentChange}
                onLabelChange={handleLabelChange}
                onResetLabel={handleResetLabel}
                onTitleChange={handleTitleChange}
                onResetTitle={handleResetTitle}
                onRemoveSection={() => removeSection(0)}
                onAddBlock={() => addBlockToSection(0)}
                onRemoveBlock={(blockIndex) => removeBlock(0, blockIndex)}
                isDraggable={false}
              />
            </SortableContext>
          </DndContext>
        )}

        {/* Body Sections */}
        <DndContext sensors={sectionSensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={bodySectionIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-8">
              {sections.map((section, sectionIndex) => {
                if (section.type === "body") {
                  return (
                    <div key={section.id}>
                      <SortableSection id={section.id}>
                        <DndContext
                          sensors={blockSensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleBlockDragEnd}
                          modifiers={[restrictToVerticalAxis, restrictToParentElement]}
                        >
                          <SortableContext
                            items={section.blocks.map((block) => block.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <OutlineSection
                              section={section}
                              sectionIndex={sectionIndex}
                              onContentChange={handleContentChange}
                              onLabelChange={handleLabelChange}
                              onResetLabel={handleResetLabel}
                              onTitleChange={handleTitleChange}
                              onResetTitle={handleResetTitle}
                              onRemoveSection={() => removeSection(sectionIndex)}
                              onAddBlock={() => addBlockToSection(sectionIndex)}
                              onRemoveBlock={(blockIndex) => removeBlock(sectionIndex, blockIndex)}
                              isDraggable={false}
                            />
                          </SortableContext>
                        </DndContext>
                      </SortableSection>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </SortableContext>
        </DndContext>

        <div className="flex justify-center py-6">
          <Button
            onClick={addBodySection}
            size="xl"
            variant="pastel-green"
            className="flex items-center gap-3 px-12 transition-all hover:scale-105"
          >
            <Plus className="h-6 w-6" />
            Add Body Section
          </Button>
        </div>

        {/* Conclusion Section */}
        {sections.length > 0 && sections[sections.length - 1].type === "conclusion" && (
          <DndContext
            sensors={blockSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleBlockDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext
              items={sections[sections.length - 1].blocks.map((block) => block.id)}
              strategy={verticalListSortingStrategy}
            >
              <OutlineSection
                section={sections[sections.length - 1]}
                sectionIndex={sections.length - 1}
                onContentChange={handleContentChange}
                onLabelChange={handleLabelChange}
                onResetLabel={handleResetLabel}
                onTitleChange={handleTitleChange}
                onResetTitle={handleResetTitle}
                onRemoveSection={() => removeSection(sections.length - 1)}
                onAddBlock={() => addBlockToSection(sections.length - 1)}
                onRemoveBlock={(blockIndex) => removeBlock(sections.length - 1, blockIndex)}
                isDraggable={false}
              />
            </SortableContext>
          </DndContext>
        )}
      </div>
      <Footer />
    </div>
  )
}
