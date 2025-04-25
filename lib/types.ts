export interface OutlineBlock {
  id: string
  label: string
  defaultLabel: string
  placeholder: string
  content: string
  type: "intro" | "body" | "conclusion"
}

export interface Section {
  id: string
  title: string
  defaultTitle: string
  type: "intro" | "body" | "conclusion"
  blocks: OutlineBlock[]
}
