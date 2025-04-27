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
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import { OutlineSection } from "@/components/outline-section"
import { SortableSection } from "@/components/sortable-section"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Save, Plus, Moon, Sun, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import type { Section, OutlineBlock } from "@/lib/types"
import { generateId } from "@/lib/utils"
import Footer from "@/components/footer";
import { formatOutline, downloadFile } from "@/lib/utils"
import { ExportModal } from "@/components/export-modal"
import { BackupModal } from "@/components/backup-modal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";


export default function SermonOutlinePlanner() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false);

  const touchSensorConfig = useMemo(() => ({
    activationConstraint: {
      delay: 0,
      distance: 5,
    },
  }), []);

  const pointerSensorConfig = useMemo(() => ({
    activationConstraint: {
      delay: 0,
      distance: 5,
    },
  }), []);

  const keyboardSensorConfig = useMemo(() => ({
    coordinateGetter: sortableKeyboardCoordinates,
  }), []);

  const touchSensor = useSensor(TouchSensor, touchSensorConfig);
  const pointerSensor = useSensor(PointerSensor, pointerSensorConfig);
  const keyboardSensor = useSensor(KeyboardSensor, keyboardSensorConfig);

  const sectionSensors = useSensors(touchSensor, pointerSensor, keyboardSensor);
  const blockSensors = useSensors(touchSensor, pointerSensor, keyboardSensor);



  const bodySectionIds = useMemo(() =>
    sections.filter((section) => section.type === "body").map((section) => section.id),
    [sections]
  );

  // Default sections for initialization and reset
  const getDefaultSections = (): Section[] => [
    {
      id: "intro-section",
      title: "Introduction",
      defaultTitle: "Introduction",
      type: "intro",
      blocks: [
        {
          id: "hook",
          label: "Hook / Opening Question",
          defaultLabel: "Hook / Opening Question",
          placeholder: "Begin with bold question, statement, or story:\n'Today, we will be looking at how we are called to...'",
          content: "",
          type: "intro",
        },
        {
          id: "context",
          label: "Context or Background",
          defaultLabel: "Context or Background",
          placeholder: "Briefly introduce scriptural passage or real-world context:\n'Let me tell you a story from my life.'",
          content: "",
          type: "intro",
        },
        {
          id: "thesis",
          label: "Thesis Statement (Theme)",
          defaultLabel: "Thesis Statement (Theme)",
          placeholder:
            "Summarize the main message in one sentence:\n'The Book of Job reveals man's struggle to reconcile suffering with faith in unseen sovereignty.'",
          content: "",
          type: "intro",
        },
      ],
    },
    {
      id: "body-section-1",
      title: "Body Section 1",
      defaultTitle: "Body Section 1",
      type: "body",
      blocks: [
        {
          id: "body-1-topic",
          label: "Main Point / Topic Sentence",
          defaultLabel: "Main Point / Topic Sentence",
          placeholder: "Introduce point, relate to thesis:\n'Faith is constantly challenged, and we know...'",
          content: "",
          type: "body",
        },
        {
          id: "body-1-scripture",
          label: "Scripture",
          defaultLabel: "Scripture",
          placeholder: "Job 42:1–6.",
          content: "",
          type: "body",
        },
        {
          id: "body-1-explanation",
          label: "Explanation",
          defaultLabel: "Explanation",
          placeholder: "Unpack the meaning or lesson from the Scripture:\n'Job accepts it's okay to be...'",
          content: "",
          type: "body",
        },
        {
          id: "body-1-application",
          label: "Application",
          defaultLabel: "Application",
          placeholder: "How does this apply to today?\n'We all know that...",
          content: "",
          type: "body",
        },
        {
          id: "body-1-transition",
          label: "Summary Sentence",
          defaultLabel: "Summary Sentence",
          placeholder: "Tie and transition:\n'The passage teaches us that we can only..",
          content: "",
          type: "body",
        },
      ],
    },
    {
      id: "conclusion-section",
      title: "Conclusion",
      defaultTitle: "Conclusion",
      type: "conclusion",
      blocks: [
        {
          id: "restate-thesis",
          label: "Theme Recap",
          defaultLabel: "Theme Recap",
          placeholder: "Reword central message clearly:\n'Through Job, we know our struggles are accompanied by choices to trust...",
          content: "",
          type: "conclusion",
        },
        {
          id: "summary",
          label: "Summary",
          defaultLabel: "Summary",
          placeholder: "Briefly recap body sections:\n'We are challenged to live in faith, so...",
          content: "",
          type: "conclusion",
        },
        {
          id: "call-to-action",
          label: "Final Word or Challenge",
          defaultLabel: "Final Word or Challenge",
          placeholder: "Give something to consider and practice:\n'Today, I ask you to examine...",
          content: "",
          type: "conclusion",
        },
        {
          id: "closing",
          label: "Closing Prayer or Scripture",
          defaultLabel: "Closing Prayer or Scripture",
          placeholder: "End with prayer or passage\n'Let's end with a short passage in Colossians Chapter...",
          content: "",
          type: "conclusion",
        },
      ],
    },
  ]

  // Fix for theme and mounting issues
  useEffect(() => {
    // Set mounted first to indicate component is in the DOM
    setMounted(true)

    // Only initialize dark mode if it's not already set
    if (typeof window !== 'undefined' && !localStorage.getItem('theme')) {
      setTheme("dark")
    }
  }, [setTheme])

  // Separate effect for loading data to avoid race conditions
  useEffect(() => {
    // Only proceed if component is mounted
    if (!mounted) return

    try {
      // Load data from localStorage or initialize with default sections
      const savedOutline = localStorage.getItem("sermonOutline")

      if (savedOutline) {
        setSections(JSON.parse(savedOutline))
      } else {
        // Initialize with default sections
        setSections(getDefaultSections())
      }
    } catch (e) {
      console.error("Error loading outline data:", e)
      setSections(getDefaultSections())
    } finally {
      setLoading(false)
    }
  }, [mounted]) // Only run this effect when mounted changes



  const handleBlockDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const blockMap = new Map<string, { sectionIndex: number, blockIndex: number }>();
    sections.forEach((section, sectionIndex) => {
      section.blocks.forEach((block, blockIndex) => {
        blockMap.set(block.id, { sectionIndex, blockIndex });
      });
    });
    const activeBlockInfo = blockMap.get(active.id as string);
    const overBlockInfo = blockMap.get(over.id as string);
    if (!activeBlockInfo || !overBlockInfo) return;
    if (activeBlockInfo.sectionIndex === overBlockInfo.sectionIndex) {
      const newSections = [...sections]
      const sectionIndex = activeBlockInfo.sectionIndex

      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        blocks: arrayMove(newSections[sectionIndex].blocks, activeBlockInfo.blockIndex, overBlockInfo.blockIndex),
      }

      setSections(newSections)
    } else {
      // If blocks are in different sections
      const newSections = [...sections]
      const activeSection = newSections[activeBlockInfo.sectionIndex]
      const overSection = newSections[overBlockInfo.sectionIndex]

      // Get the block to move
      const [blockToMove] = activeSection.blocks.splice(activeBlockInfo.blockIndex, 1)

      // Update the block type to match its new section
      blockToMove.type = overSection.type

      // Insert the block at the new position
      overSection.blocks.splice(overBlockInfo.blockIndex, 0, blockToMove)

      setSections(newSections)

      // Show a toast notification about the block being moved to a different section
      toast({
        title: "Block Moved",
        description: `Block moved to ${overSection.title}`,
        duration: 2000,
      })
    }
  }

  const handleSectionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((section) => section.id === active.id)
    const newIndex = sections.findIndex((section) => section.id === over.id)

    // Don't allow moving intro or conclusion sections
    const sectionType = sections[oldIndex].type
    if (sectionType === "intro" || sectionType === "conclusion") {
      toast({
        title: "Cannot Move Section",
        description: "Introduction and Conclusion sections cannot be moved.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    // Don't allow moving body sections outside the range between intro and conclusion
    if (newIndex === 0 || newIndex === sections.length - 1) {
      toast({
        title: "Cannot Move Section",
        description: "Body sections must remain between Introduction and Conclusion.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }


    const newSections = arrayMove(sections, oldIndex, newIndex)
    setSections(newSections)
  }

  const handleContentChange = (sectionIndex: number, blockIndex: number, content: string) => {
    setSections(prev => prev.map((section, i) =>
      i === sectionIndex ? {
        ...section,
        blocks: section.blocks.map((block, j) =>
          j === blockIndex ? { ...block, content } : block
        )
      } : section
    ))
  }

  const handleLabelChange = (sectionIndex: number, blockIndex: number, newLabel: string) => {
    const newSections = [...sections]
    newSections[sectionIndex].blocks[blockIndex].label = newLabel
    setSections(newSections)
  }

  const handleResetLabel = (sectionIndex: number, blockIndex: number) => {
    const newSections = [...sections]
    const defaultLabel = newSections[sectionIndex].blocks[blockIndex].defaultLabel
    newSections[sectionIndex].blocks[blockIndex].label = defaultLabel
    setSections(newSections)

    toast({
      title: "Label Reset",
      description: "The label has been reset to its default value.",
      duration: 2000,
    })
  }

  const handleTitleChange = (sectionIndex: number, newTitle: string) => {
    const newSections = [...sections]
    newSections[sectionIndex].title = newTitle
    setSections(newSections)
  }

  const handleResetTitle = (sectionIndex: number) => {
    const newSections = [...sections]
    const defaultTitle = newSections[sectionIndex].defaultTitle
    newSections[sectionIndex].title = defaultTitle
    setSections(newSections)

    toast({
      title: "Title Reset",
      description: "The section title has been reset to its default value.",
      duration: 2000,
    })
  }

  const addBodySection = () => {
    // Find the next available body section number
    let maxBodyNumber = 0
    sections.forEach((section) => {
      if (section.type === "body") {
        const match = section.id.match(/body-section-(\d+)/)
        if (match) {
          const num = Number.parseInt(match[1], 10)
          if (num > maxBodyNumber) {
            maxBodyNumber = num
          }
        }
      }
    })

    const newBodyIndex = maxBodyNumber + 1

    // Find the index where to insert the new body section (before conclusion)
    const conclusionIndex = sections.findIndex((section) => section.type === "conclusion")

    const newBodySection: Section = {
      id: `body-section-${newBodyIndex}`,
      title: `Body Section ${newBodyIndex}`,
      defaultTitle: `Body Section ${newBodyIndex}`,
      type: "body",
      blocks: [
        {
          id: `body-${newBodyIndex}-topic`,
          label: "Main Point / Topic Sentence",
          defaultLabel: "Main Point / Topic Sentence",
          placeholder: "Introduce point, relate to thesis:\n'Faith is constantly challenged, and we know...'",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyIndex}-scripture`,
          label: "Scripture",
          defaultLabel: "Scripture",
          placeholder: "Job 42:1–6.",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyIndex}-explanation`,
          label: "Explanation",
          defaultLabel: "Explanation",
          placeholder: "Unpack the meaning or lesson from the Scripture:\n'Job accepts it's okay to be...'",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyIndex}-application`,
          label: "Application",
          defaultLabel: "Application",
          placeholder: "How does this apply to today?\n'We all know that...",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyIndex}-transition`,
          label: "Summary Sentence",
          defaultLabel: "Summary Sentence",
          placeholder: "Tie and transition:\n'The passage teaches us that we can only.",
          content: "",
          type: "body",
        },
      ],
    }

    const newSections = [...sections]
    newSections.splice(conclusionIndex, 0, newBodySection)
    setSections(newSections)

    toast({
      title: "Section Added",
      description: `Body Section ${newBodyIndex} has been added to your outline.`,
      duration: 3000,
    })
  }

  const addBlockToSection = (sectionIndex: number, label = "New Block") => {
    const section = sections[sectionIndex]
    const newBlock: OutlineBlock = {
      id: generateId(),
      label: label,
      defaultLabel: label,
      placeholder: "Add your content here...",
      content: "",
      type: section.type,
    }

    const newSections = [...sections]
    newSections[sectionIndex].blocks.push(newBlock)
    setSections(newSections)

    toast({
      title: "Block Added",
      description: `A new block has been added to ${section.title}.`,
      duration: 2000,
    })
  }

  const removeBlock = (sectionIndex: number, blockIndex: number) => {
    const newSections = [...sections]

    // Don't allow removing if it's the last block in the section
    if (newSections[sectionIndex].blocks.length <= 1) {
      toast({
        title: "Cannot Remove Block",
        description: "A section must have at least one block.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    newSections[sectionIndex].blocks.splice(blockIndex, 1)
    setSections(newSections)

    toast({
      title: "Block Removed",
      description: "The block has been removed from your outline.",
      duration: 2000,
    })
  }

  const removeSection = (sectionIndex: number) => {
    // Don't allow removing intro or conclusion
    const sectionType = sections[sectionIndex].type
    if (sectionType === "intro" || sectionType === "conclusion") {
      toast({
        title: "Cannot Remove Section",
        description: "Introduction and Conclusion sections cannot be removed.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    const newSections = [...sections]
    newSections.splice(sectionIndex, 1)
    setSections(newSections)

    toast({
      title: "Section Removed",
      description: "The section has been removed from your outline.",
      duration: 3000,
    })
  }

  const handleExport = (format: "pdf" | "docx" | "txt" | "md") => {
    const formatted = formatOutline(sections, format);
    downloadFile(formatted, format);
    toast({
      title: `Exported as ${format.toUpperCase()}`,
      description: `Outline downloaded successfully.`,
      duration: 3000,
    });
  };

  const saveOutlineToLocalStorage = () => {
    localStorage.setItem("sermonOutline", JSON.stringify(sections));
    toast({
      title: "Outline Saved",
      description: "Your sermon outline has been saved to local storage.",
      duration: 3000,
    })
  };

  const saveOutlineAsJson = () => {
    const now = new Date()
    const jsonData = JSON.stringify(sections, null, 2)
    const blob = new Blob([jsonData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sermon-outline-${now.toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Outline Saved",
      description: "Your sermon outline has been downloaded as JSON.",
      duration: 3000,
    })
  }
  const handleResetAll = () => {
    setShowResetModal(true);
  };

  const confirmResetAll = () => {
    const defaultSections = getDefaultSections();
    setSections(defaultSections);
    localStorage.setItem("sermonOutline", JSON.stringify(defaultSections));
    setShowResetModal(false);
    toast({
      title: "Outline Reset",
      description: "All sections and blocks have been reset to their default state.",
      duration: 2000,
    });
  };

  const cancelResetAll = () => {
    setShowResetModal(false);
  };

  const loadOutlineFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const parsedSections = JSON.parse(content)

        // Validate the loaded data has the expected structure
        if (
          Array.isArray(parsedSections) &&
          parsedSections.length > 0 &&
          parsedSections[0].blocks &&
          Array.isArray(parsedSections[0].blocks)
        ) {
          setSections(parsedSections)

          toast({
            title: "Outline Loaded",
            description: "Your sermon outline has been loaded successfully.",
            duration: 3000,
          })
        } else {
          throw new Error("Invalid outline format")
        }
      } catch (error) {
        console.error("Error loading outline:", error)
        toast({
          title: "Error Loading Outline",
          description: "The file format is invalid or corrupted.",
          variant: "destructive",
          duration: 3000,
        })
      }
    }
    reader.readAsText(file)

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  // Show a proper loading state
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (

    <div className="container mx-auto px-4 py-8 max-w-5xl pb-24">
      <header className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-8 w-8" />
              <h1 className="text-3xl font-bold">Drag and Preach</h1>
            </div>
            <p className="text-muted-foreground">
            Organize, structure, and export your sermons with ease.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full border-gray-300 dark:border-gray-600"
          >
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>
        <div className="flex flex-wrap gap-4">

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button onClick={saveOutlineToLocalStorage} className="flex-1 sm:flex-none bg-blue-500 hover:bg-blue-600 text-white">
              <Save className="h-4 w-4 sm:mr-2" />
              <span>Save</span>
            </Button>
            <BackupModal
              onDownload={saveOutlineAsJson}
              onUpload={triggerFileInput}
            />
            <ExportModal onExport={handleExport} />
            <Button onClick={handleResetAll} variant="outline" className="flex-1 sm:flex-none border-red-500 text-red-500 hover:bg-red-50">
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="sm:hidden">Reset</span>
              <span className="hidden sm:inline">Reset All</span>
            </Button>
          </div>
          <input type="file" ref={fileInputRef} onChange={loadOutlineFromJson} accept=".json" className="hidden" />
        </div>
      </header >

      <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset All Sections</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Warning: Saves will be overwritten! Are you sure you want to reset all sections to their default state?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={cancelResetAll}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmResetAll}>
                Reset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        {/* Introduction Section (not draggable) */}
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

        {/* Body Sections (draggable) */}
        <DndContext sensors={sectionSensors} collisionDetection={closestCenter} onDragEnd={handleSectionDragEnd}>
          <SortableContext items={bodySectionIds} strategy={verticalListSortingStrategy}>
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
          </SortableContext>
        </DndContext>

        {/* Add Body Section button */}
        <div className="flex justify-center my-6">
          <Button
            onClick={addBodySection}
            size="lg"
            variant="outline"
            className="border-2 border-green-500/30 bg-green-500/10 hover:bg-green-500/20 flex items-center gap-2 px-6 py-6 h-auto shadow-md"
          >
            <Plus className="h-5 w-5" />
            Add Body Section
          </Button>
        </div>

        {/* Conclusion Section (not draggable) */}
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
    </div >
  )
}
