"use client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog"

interface ExportModalProps {
  onExport: (format: "pdf" | "docx" | "txt" | "md") => void
}

export function ExportModal({ onExport }: ExportModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Export Outline</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="sr-only">Export Options</DialogTitle>
        <div className="space-y-2">
          <Button onClick={() => onExport("pdf")} className="w-full">
            Export as PDF
          </Button>
          <Button onClick={() => onExport("docx")} className="w-full">
            Export as DOCX
          </Button>
          <Button onClick={() => onExport("txt")} className="w-full">
            Export as TXT
          </Button>
          <Button onClick={() => onExport("md")} className="w-full">
            Export as Markdown
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}