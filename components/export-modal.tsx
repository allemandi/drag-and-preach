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
        <Button variant="pastel-purple" className="flex-1 sm:flex-none h-12 px-8">
          <FileText className="h-5 w-5 sm:mr-2" />
          <span className="font-semibold">Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-2 border-pastel-border-purple p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-center mb-8 tracking-tight">Export Outline</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-5 mt-2">
          {exportOptions.map((option) => (
            <Button
              key={option.format}
              onClick={() => onExport(option.format)}
              variant={option.variant}
              className="w-full h-32 flex flex-col items-center justify-center gap-3 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              <option.icon className="h-10 w-10" />
              <span className="text-lg font-bold">{option.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}