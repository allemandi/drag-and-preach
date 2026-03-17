"use client";

import { FileText, FileCode2, FileArchive, FileJson, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface ExportModalProps {
  onExport: (format: "pdf" | "docx" | "txt" | "md") => void;
  isExporting: boolean;
}

export function ExportModal({ onExport, isExporting }: ExportModalProps) {
  const [open, setOpen] = useState(false);

  const exportOptions = [
    { format: "pdf" as const, label: "PDF", icon: FileText, variant: "pastel-rose" as const },
    { format: "docx" as const, label: "Word (DOCX)", icon: FileCode2, variant: "pastel-blue" as const },
    { format: "txt" as const, label: "Plain Text (TXT)", icon: FileArchive, variant: "pastel-amber" as const },
    { format: "md" as const, label: "Markdown (MD)", icon: FileJson, variant: "pastel-green" as const },
  ];

  const handleExport = (format: "pdf" | "docx" | "txt" | "md") => {
    onExport(format);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="pastel-purple" size="sm" disabled={isExporting}>
          {isExporting ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <FileText className="h-4 w-4 mr-1.5" />}
          <span>{isExporting ? "Exporting..." : "Export"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-2xl border border-pastel-border-purple p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center mb-6 tracking-tight">Export Outline</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 mt-2">
          {exportOptions.map((option) => (
            <Button
              key={option.format}
              onClick={() => handleExport(option.format)}
              variant={option.variant}
              disabled={isExporting}
              className="w-full h-20 flex flex-col items-center justify-center gap-1.5 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
            >
              {isExporting ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <option.icon className="h-6 w-6" />
              )}
              <span className="text-xs font-bold">{option.label}</span>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}