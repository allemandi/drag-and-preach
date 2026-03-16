"use client";

import { FileText, FileCode2, FileArchive, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ExportModalProps {
  onExport: (format: "pdf" | "docx" | "txt" | "md") => void;
}

export function ExportModal({ onExport }: ExportModalProps) {
  const exportOptions = [
    { format: "pdf" as const, label: "PDF", icon: FileText, variant: "pastel-rose" as const },
    { format: "docx" as const, label: "Word (DOCX)", icon: FileCode2, variant: "pastel-blue" as const },
    { format: "txt" as const, label: "Plain Text (TXT)", icon: FileArchive, variant: "pastel-amber" as const },
    { format: "md" as const, label: "Markdown (MD)", icon: FileJson, variant: "pastel-green" as const },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="pastel-purple" className="flex-1 sm:flex-none">
          <FileText className="h-4 w-4 sm:mr-2" />
          <span>Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-xl border-2 border-pastel-border-purple">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">Export Outline</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-2">
          {exportOptions.map((option) => (
            <Button
              key={option.format}
              onClick={() => onExport(option.format)}
              variant={option.variant}
              className="w-full h-24 flex flex-col items-center justify-center gap-2"
            >
              <option.icon className="h-7 w-7" />
              <span className="font-semibold">{option.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}