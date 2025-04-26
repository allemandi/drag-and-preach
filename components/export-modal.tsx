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
        <Button variant="outline" className="flex-1 sm:flex-none bg-purple-500 hover:bg-purple-600 text-white">
          <FileText className="h-4 w-4 sm:mr-2" />
          <span>Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Outline</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button
            onClick={() => onExport("pdf")}
            variant="outline"
            className="w-full justify-start"
          >
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button
            onClick={() => onExport("docx")}
            variant="outline"
            className="w-full justify-start"
          >
            <FileCode2 className="h-4 w-4 mr-2" />
            Word (DOCX)
          </Button>
          <Button
            onClick={() => onExport("txt")}
            variant="outline"
            className="w-full justify-start"
          >
            <FileArchive className="h-4 w-4 mr-2" />
            Plain Text (TXT)
          </Button>
          <Button
            onClick={() => onExport("md")}
            variant="outline"
            className="w-full justify-start"
          >
            <FileCode2 className="h-4 w-4 mr-2" />
            Markdown (MD)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}