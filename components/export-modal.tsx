"use client";

import { FileText, FileCode2, FileArchive } from "lucide-react";
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="pastel-purple" className="flex-1 sm:flex-none">
          <FileText className="h-4 w-4 sm:mr-2" />
          <span>Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-xl border-2 border-pastel-border-purple">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">Export Outline</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
          <Button
            onClick={() => onExport("pdf")}
            variant="pastel"
            className="w-full h-24 flex flex-col gap-2"
          >
            <FileText className="h-6 w-6" />
            PDF
          </Button>
          <Button
            onClick={() => onExport("docx")}
            variant="pastel-blue"
            className="w-full h-24 flex flex-col gap-2"
          >
            <FileCode2 className="h-6 w-6" />
            Word (DOCX)
          </Button>
          <Button
            onClick={() => onExport("txt")}
            variant="pastel-amber"
            className="w-full h-24 flex flex-col gap-2"
          >
            <FileArchive className="h-6 w-6" />
            Plain Text (TXT)
          </Button>
          <Button
            onClick={() => onExport("md")}
            variant="pastel-green"
            className="w-full h-24 flex flex-col gap-2"
          >
            <FileCode2 className="h-6 w-6" />
            Markdown (MD)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}