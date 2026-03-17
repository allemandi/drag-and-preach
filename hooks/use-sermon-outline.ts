"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { type DragEndEvent } from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { useToast } from "@/components/ui/use-toast"
import type { Section, OutlineBlock } from "@/lib/types"
import { generateId, formatOutline, downloadFile } from "@/lib/utils"

// Default sections for initialization and reset
export const getDefaultSections = (): Section[] => [
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

export function useSermonOutline() {
  const [sections, setSections] = useState<Section[]>(getDefaultSections())
  const { toast } = useToast()
  const [showResetModal, setShowResetModal] = useState(false)

  const bodySectionIds = useMemo(() =>
    sections.filter((section) => section.type === "body").map((section) => section.id),
    [sections]
  )

  useEffect(() => {
    try {
      const savedOutline = localStorage.getItem("sermonOutline")
      if (savedOutline) {
        setSections(JSON.parse(savedOutline))
      }
    } catch (e) {
      console.error("Error loading outline data:", e)
    }
  }, [])

  const handleBlockDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const blockMap = new Map<string, { sectionIndex: number, blockIndex: number }>()
    sections.forEach((section, sectionIndex) => {
      section.blocks.forEach((block, blockIndex) => {
        blockMap.set(block.id, { sectionIndex, blockIndex })
      })
    })

    const activeBlockInfo = blockMap.get(active.id as string)
    const overBlockInfo = blockMap.get(over.id as string)

    if (!activeBlockInfo || !overBlockInfo) return

    if (activeBlockInfo.sectionIndex === overBlockInfo.sectionIndex) {
      const sectionIndex = activeBlockInfo.sectionIndex
      const newSections = sections.map((section, idx) =>
        idx === sectionIndex
          ? {
              ...section,
              blocks: arrayMove(section.blocks, activeBlockInfo.blockIndex, overBlockInfo.blockIndex),
            }
          : section
      )

      setSections(newSections)
    } else {
      const { sectionIndex: activeSectionIndex, blockIndex: activeBlockIndex } = activeBlockInfo
      const { sectionIndex: overSectionIndex, blockIndex: overBlockIndex } = overBlockInfo

      const newSections = sections.map((section, idx) => {
        if (idx === activeSectionIndex) {
          const newBlocks = [...section.blocks]
          newBlocks.splice(activeBlockIndex, 1)
          return { ...section, blocks: newBlocks }
        }
        if (idx === overSectionIndex) {
          const blockToMove = { ...sections[activeSectionIndex].blocks[activeBlockIndex], type: section.type }
          const newBlocks = [...section.blocks]
          newBlocks.splice(overBlockIndex, 0, blockToMove)
          return { ...section, blocks: newBlocks }
        }
        return section
      })

      setSections(newSections)

      toast({
        title: "Block Moved",
        description: `Block moved to ${sections[overSectionIndex].title}`,
        duration: 2000,
      })
    }
  }, [sections, toast])

  const handleSectionDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex((section) => section.id === active.id)
    const newIndex = sections.findIndex((section) => section.id === over.id)

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
  }, [sections, toast])

  const handleContentChange = useCallback((sectionIndex: number, blockIndex: number, content: string) => {
    setSections(prev => prev.map((section, i) =>
      i === sectionIndex ? {
        ...section,
        blocks: section.blocks.map((block, j) =>
          j === blockIndex ? { ...block, content } : block
        )
      } : section
    ))
  }, [])

  const handleLabelChange = useCallback((sectionIndex: number, blockIndex: number, newLabel: string) => {
    setSections(prev => prev.map((section, i) =>
      i === sectionIndex ? {
        ...section,
        blocks: section.blocks.map((block, j) =>
          j === blockIndex ? { ...block, label: newLabel } : block
        )
      } : section
    ))
  }, [])

  const handleResetLabel = useCallback((sectionIndex: number, blockIndex: number) => {
    setSections(prev => prev.map((section, i) =>
      i === sectionIndex ? {
        ...section,
        blocks: section.blocks.map((block, j) =>
          j === blockIndex ? { ...block, label: block.defaultLabel } : block
        )
      } : section
    ))

    toast({
      title: "Label Reset",
      description: "The label has been reset to its default value.",
      duration: 2000,
    })
  }, [toast])

  const handleTitleChange = useCallback((sectionIndex: number, newTitle: string) => {
    setSections(prev => prev.map((section, i) =>
      i === sectionIndex ? { ...section, title: newTitle } : section
    ))
  }, [])

  const handleResetTitle = useCallback((sectionIndex: number) => {
    setSections(prev => prev.map((section, i) =>
      i === sectionIndex ? { ...section, title: section.defaultTitle } : section
    ))

    toast({
      title: "Title Reset",
      description: "The section title has been reset to its default value.",
      duration: 2000,
    })
  }, [toast])

  const addBodySection = useCallback(() => {
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

    const newBodyNumber = maxBodyNumber + 1
    const conclusionIndex = sections.findIndex((section) => section.type === "conclusion")

    const newBodySection: Section = {
      id: `body-section-${newBodyNumber}`,
      title: `Body Section ${newBodyNumber}`,
      defaultTitle: `Body Section ${newBodyNumber}`,
      type: "body",
      blocks: [
        {
          id: `body-${newBodyNumber}-topic`,
          label: "Main Point / Topic Sentence",
          defaultLabel: "Main Point / Topic Sentence",
          placeholder: "Introduce point, relate to thesis:\n'Faith is constantly challenged, and we know...'",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyNumber}-scripture`,
          label: "Scripture",
          defaultLabel: "Scripture",
          placeholder: "Job 42:1–6.",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyNumber}-explanation`,
          label: "Explanation",
          defaultLabel: "Explanation",
          placeholder: "Unpack the meaning or lesson from the Scripture:\n'Job accepts it's okay to be...'",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyNumber}-application`,
          label: "Application",
          defaultLabel: "Application",
          placeholder: "How does this apply to today?\n'We all know that...",
          content: "",
          type: "body",
        },
        {
          id: `body-${newBodyNumber}-transition`,
          label: "Summary Sentence",
          defaultLabel: "Summary Sentence",
          placeholder: "Tie and transition:\n'The passage teaches us that we can only.",
          content: "",
          type: "body",
        },
      ],
    }

    setSections(prev => {
      const newSections = [...prev]
      newSections.splice(conclusionIndex, 0, newBodySection)
      return newSections
    })

    toast({
      title: "Section Added",
      description: `Body Section ${newBodyNumber} has been added to your outline.`,
      duration: 3000,
    })
  }, [sections, toast])

  const addBlockToSection = useCallback((sectionIndex: number, label = "New Block") => {
    const section = sections[sectionIndex]
    const newBlock: OutlineBlock = {
      id: generateId(),
      label: label,
      defaultLabel: label,
      placeholder: "Add your content here...",
      content: "",
      type: section.type,
    }

    setSections(prev => prev.map((s, i) =>
      i === sectionIndex ? { ...s, blocks: [...s.blocks, newBlock] } : s
    ))

    toast({
      title: "Block Added",
      description: `A new block has been added to ${section.title}.`,
      duration: 2000,
    })
  }, [sections, toast])

  const removeBlock = useCallback((sectionIndex: number, blockIndex: number) => {
    if (sections[sectionIndex].blocks.length <= 1) {
      toast({
        title: "Cannot Remove Block",
        description: "A section must have at least one block.",
        variant: "destructive",
        duration: 3000,
      })
      return
    }

    setSections(prev => prev.map((s, i) =>
      i === sectionIndex ? {
        ...s,
        blocks: s.blocks.filter((_, j) => j !== blockIndex)
      } : s
    ))

    toast({
      title: "Block Removed",
      description: "The block has been removed from your outline.",
      duration: 2000,
    })
  }, [sections, toast])

  const removeSection = useCallback((sectionIndex: number) => {
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

    setSections(prev => prev.filter((_, i) => i !== sectionIndex))

    toast({
      title: "Section Removed",
      description: "The section has been removed from your outline.",
      duration: 3000,
    })
  }, [sections, toast])

  const [isExporting, setIsExporting] = useState(false)

  const handleExport = useCallback(async (format: "pdf" | "docx" | "txt" | "md") => {
    setIsExporting(true)
    try {
      const formatted = formatOutline(sections, format)
      await downloadFile(formatted, format)
      toast({
        title: `Exported as ${format.toUpperCase()}`,
        description: `Outline downloaded successfully.`,
        duration: 3000,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting your outline.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsExporting(false)
    }
  }, [sections, toast])

  const [isSaving, setIsSaving] = useState(false)

  const saveOutlineToLocalStorage = useCallback(() => {
    setIsSaving(true)
    localStorage.setItem("sermonOutline", JSON.stringify(sections))
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Outline Saved",
        description: "Your sermon outline has been saved to local storage.",
        duration: 3000,
      })
    }, 500)
  }, [sections, toast])

  const saveOutlineAsJson = useCallback(() => {
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
  }, [sections, toast])

  const handleResetAll = useCallback(() => {
    setShowResetModal(true)
  }, [])

  const confirmResetAll = useCallback(() => {
    const defaultSections = getDefaultSections()
    setSections(defaultSections)
    localStorage.setItem("sermonOutline", JSON.stringify(defaultSections))
    setShowResetModal(false)
    toast({
      title: "Outline Reset",
      description: "All sections and blocks have been reset to their default state.",
      duration: 2000,
    })
  }, [toast])

  const cancelResetAll = useCallback(() => {
    setShowResetModal(false)
  }, [])

  const loadOutlineFromJson = useCallback((content: string) => {
    try {
      const parsedSections = JSON.parse(content)

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
  }, [toast])

  return {
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
    isExporting,
    isSaving,
    saveOutlineToLocalStorage,
    saveOutlineAsJson,
    handleResetAll,
    confirmResetAll,
    cancelResetAll,
    loadOutlineFromJson,
  }
}
