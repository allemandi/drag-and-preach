"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { restrictToVerticalAxis, restrictToParentElement } from "@dnd-kit/modifiers"
import { OutlineSection } from "@/components/outline-section"
import { SortableSection } from "@/components/sortable-section"
import { Button } from "@/components/ui/button"
import { Download, Save, Upload, Plus, Moon, Sun, RefreshCw } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useTheme } from "next-themes"
import type { Section, OutlineBlock } from "@/lib/types"
import { generateId } from "@/lib/utils"

export default function SermonOutlinePlanner() {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Configure sensors for section dragging
  const sectionSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: ["Space", "Enter"],
        cancel: ["Escape"],
        end: ["Space", "Enter"],
      },
    }),
  )

  // Configure sensors for block dragging
  const blockSensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: {
        start: ["Space", "Enter"],
        cancel: ["Escape"],
        end: ["Space", "Enter"],
      },
    }),
  )

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
          placeholder: "Begin with a bold question, story, or statement to engage your listeners...",
          content: "",
          type: "intro",
        },
        {
          id: "context",
          label: "Context or Background",
          defaultLabel: "Context or Background",
          placeholder: "Briefly introduce the scriptural passage or real-world context...",
          content: "",
          type: "intro",
        },
        {
          id: "thesis",
          label: "Thesis Statement (Theme)",
          defaultLabel: "Thesis Statement (Theme)",
          placeholder:
            "Summarize the main message in one sentence: 'This sermon will show how [truth] impacts [life experience].'",
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
          placeholder: "Introduce your point: 'God's promises often come through delay.'",
          content: "",
          type: "body",
        },
        {
          id: "body-1-scripture",
          label: "Scripture",
          defaultLabel: "Scripture",
          placeholder: "E.g. Genesis 37:1–11 – Joseph's dreams and early life...",
          content: "",
          type: "body",
        },
        {
          id: "body-1-explanation",
          label: "Explanation",
          defaultLabel: "Explanation",
          placeholder: "Unpack the meaning or lesson from the Scripture...",
          content: "",
          type: "body",
        },
        {
          id: "body-1-application",
          label: "Application",
          defaultLabel: "Application",
          placeholder: "How does this truth apply to real-life situations today?",
          content: "",
          type: "body",
        },
        {
          id: "body-1-transition",
          label: "Transition or Mini-Conclusion",
          defaultLabel: "Transition or Mini-Conclusion",
          placeholder: "Wrap up this point or segue into the next...",
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
          placeholder: "Reword and reinforce your central message clearly...",
          content: "",
          type: "conclusion",
        },
        {
          id: "summary",
          label: "Summary",
          defaultLabel: "Summary",
          placeholder: "Briefly recap the body sections in a list or sentence...",
          content: "",
          type: "conclusion",
        },
        {
          id: "call-to-action",
          label: "Final Word or Challenge",
          defaultLabel: "Final Word or Challenge",
          placeholder: "Encourage or challenge the listener with a takeaway...",
          content: "",
          type: "conclusion",
        },
        {
          id: "closing",
          label: "Closing Prayer or Scripture",
          defaultLabel: "Closing Prayer or Scripture",
          placeholder: "End with a brief prayer or a powerful final verse...",
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
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Find which section contains the dragged block
    const activeBlockId = active.id as string
    const overBlockId = over.id as string

    let activeBlockInfo: { sectionIndex: number; blockIndex: number } | null = null
    let overBlockInfo: { sectionIndex: number; blockIndex: number } | null = null

    sections.forEach((section, sectionIndex) => {
      section.blocks.forEach((block, blockIndex) => {
        if (block.id === activeBlockId) {
          activeBlockInfo = { sectionIndex, blockIndex }
        }
        if (block.id === overBlockId) {
          overBlockInfo = { sectionIndex, blockIndex }
        }
      })
    })

    if (!activeBlockInfo || !overBlockInfo) return

    // Get the section types
    const activeSection = sections[activeBlockInfo.sectionIndex]
    const overSection = sections[overBlockInfo.sectionIndex]

    // If blocks are in the same section
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

    // Move the section without renaming
    const newSections = arrayMove(sections, oldIndex, newIndex)
    setSections(newSections)
  }

  const handleContentChange = (sectionIndex: number, blockIndex: number, newContent: string) => {
    const newSections = [...sections]
    newSections[sectionIndex].blocks[blockIndex].content = newContent
    setSections(newSections)
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
          placeholder: "Introduce your point: 'God's promises often come through delay.'",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyIndex}-scripture`,
          label: "Scripture",
          defaultLabel: "Scripture",
          placeholder: "E.g. Genesis 37:1–11 – Joseph's dreams and early life...",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyIndex}-explanation`,
          label: "Explanation",
          defaultLabel: "Explanation",
          placeholder: "Unpack the meaning or lesson from the Scripture...",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyIndex}-application`,
          label: "Application",
          defaultLabel: "Application",
          placeholder: "How does this truth apply to real-life situations today?",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyIndex}-transition`,
          label: "Transition or Mini-Conclusion",
          defaultLabel: "Transition or Mini-Conclusion",
          placeholder: "Wrap up this point or segue into the next...",
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

  const exportToMarkdown = () => {
    let markdown = "# Sermon Outline\n\n"

    // Add date and time
    const now = new Date()
    markdown += `*Created: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}*\n\n`
    markdown += "---\n\n"

    sections.forEach((section) => {
      markdown += `## ${section.title}\n\n`

      section.blocks.forEach((block) => {
        markdown += `### ${block.label}\n\n`

        if (block.content) {
          markdown += `${block.content}\n\n`
        } else {
          markdown += `*${block.placeholder}*\n\n`
        }

        markdown += "---\n\n"
      })
    })

    // Create a blob and download it
    const blob = new Blob([markdown], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sermon-outline-${now.toISOString().split("T")[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Outline Exported",
      description: "Your sermon outline has been exported as Markdown.",
      duration: 3000,
    })
  }

  const saveOutlineToLocalStorage = () => {
    localStorage.setItem("sermonOutline", JSON.stringify(sections))

    toast({
      title: "Outline Saved",
      description: "Your sermon outline has been saved to local storage.",
      duration: 3000,
    })
  }

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
    setSections(getDefaultSections())
    toast({
      title: "Outline Reset",
      description: "All sections and blocks have been reset to their default state. Your previous Saved state is still preserved.",
      duration: 2000,
    })
  }

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

  // Get only the body section IDs for the sortable context
  const bodySectionIds = sections.filter((section) => section.type === "body").map((section) => section.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <header className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Sermon Outline Planner</h1>
          <Button variant="outline" size="icon" onClick={toggleTheme} className="rounded-full">
            {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </div>

        <p className="text-muted-foreground mb-6">
          Create, organize, and edit your sermon outline with drag-and-drop simplicity
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <Button onClick={saveOutlineToLocalStorage} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Outline
          </Button>
          <Button onClick={saveOutlineAsJson} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Download JSON
          </Button>
          <Button onClick={triggerFileInput} variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Load JSON
          </Button>
          <input type="file" ref={fileInputRef} onChange={loadOutlineFromJson} accept=".json" className="hidden" />
          <Button onClick={exportToMarkdown} variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export as Markdown
          </Button>
          <Button onClick={handleResetAll} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset All
          </Button>
        </div>
      </header>

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
    </div>
  )
}