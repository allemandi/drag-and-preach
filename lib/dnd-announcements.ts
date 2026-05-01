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
      const activeItem = items.find((i) => i.id === active.id)
      const overItem = items.find((i) => i.id === over.id)
      const activeName = activeItem ? getTitle(activeItem) : active.id
      const overName = overItem ? getTitle(overItem) : over.id
      return `${itemName} ${activeName} was moved over ${itemName} ${overName}.`
    }
    return `${itemName} ${active.id} is no longer over a droppable area.`
  },
  onDragEnd({ active, over }: DragEndEvent) {
    if (over) {
      const activeItem = items.find((i) => i.id === active.id)
      const overItem = items.find((i) => i.id === over.id)
      const activeName = activeItem ? getTitle(activeItem) : active.id
      const overName = overItem ? getTitle(overItem) : over.id
      return `${itemName} ${activeName} was dropped over ${itemName} ${overName}.`
    }
    return `${itemName} ${active.id} was dropped.`
  },
  onDragCancel({ active }: DragEndEvent) {
    return `Dragging was cancelled. ${itemName} ${active.id} was dropped.`
  },
})
