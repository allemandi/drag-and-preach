"use client";

import { Download, Upload, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

interface BackupModalProps {
  onDownload: () => void;
  onUpload: () => void;
}

export function BackupModal({ onDownload, onUpload }: BackupModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="pastel-green" size="sm">
          <Database className="h-4 w-4 mr-1.5" />
          <span>Backup</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px] rounded-2xl border border-pastel-border-green p-6 shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center mb-6 tracking-tight">Backup Options</DialogTitle>
          <DialogDescription className="sr-only">
            Download your current work as a backup file or load a previous backup.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-3 mt-2">
          <Button
            onClick={() => handleAction(onDownload)}
            variant="pastel-blue"
            className="w-full h-16 text-sm font-bold flex flex-col items-center justify-center gap-1 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Download className="h-5 w-5" />
            <span>Download Backup</span>
          </Button>
          <Button
            onClick={() => handleAction(onUpload)}
            variant="pastel-amber"
            className="w-full h-16 text-sm font-bold flex flex-col items-center justify-center gap-1 rounded-xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Upload className="h-5 w-5" />
            <span>Load Backup</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}