import { DragStartEvent, DragOverEvent, DragEndEvent, defaultAnnouncements } from "@dnd-kit/core"

export const createAnnouncements = <T extends { id: string }>(
  itemName: string,
  items: T[],
  getTitle: (item: T) => string | undefined
) => ({
  ...defaultAnnouncements,
  onDragStart({ active }: DragStartEvent) {
    const activeItem = items.find((i) => i.id === active.id)
    return `Picked up ${itemName} ${activeItem ? getTitle(activeItem) : active.id}.`
  },
  onDragOver({ active, over }: DragOverEvent) {
    if (over) {
      const activeIndex = items.findIndex((i) => i.id === active.id)
      const overIndex = items.findIndex((i) => i.id === over.id)
      const activeItem = items[activeIndex]
      const overItem = items[overIndex]
      const activeName = activeItem ? getTitle(activeItem) : active.id
      const overName = overItem ? getTitle(overItem) : over.id

      const position = activeIndex <= overIndex ? "after" : "before"

      return `${itemName} ${activeName} was moved ${position} ${itemName} ${overName}.`
    }
    return `${itemName} ${active.id} is no longer over a droppable area.`
  },
  onDragEnd({ active, over }: DragEndEvent) {
    if (over) {
      const activeIndex = items.findIndex((i) => i.id === active.id)
      const overIndex = items.findIndex((i) => i.id === over.id)
      const activeItem = items[activeIndex]
      const overItem = items[overIndex]
      const activeName = activeItem ? getTitle(activeItem) : active.id
      const overName = overItem ? getTitle(overItem) : over.id

      return `${itemName} ${activeName} was dropped into position ${overIndex + 1}.`
    }
    return `${itemName} ${active.id} was dropped.`
  },
  onDragCancel({ active }: DragEndEvent) {
    return `Dragging was cancelled. ${itemName} ${active.id} was dropped.`
  },
})
