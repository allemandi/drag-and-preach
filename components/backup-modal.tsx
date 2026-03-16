"use client";

import { Download, Upload, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
        <Button variant="pastel-green" className="flex-1 sm:flex-none">
          <Database className="h-4 w-4 sm:mr-2" />
          <span>Backup</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-xl border-2 border-pastel-border-green">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-6">Backup Options</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 mt-2">
          <Button
            onClick={() => handleAction(onDownload)}
            variant="pastel-blue"
            className="w-full h-20 text-lg flex flex-col items-center justify-center gap-1"
          >
            <Download className="h-6 w-6" />
            <span>Download Backup</span>
          </Button>
          <Button
            onClick={() => handleAction(onUpload)}
            variant="pastel-amber"
            className="w-full h-20 text-lg flex flex-col items-center justify-center gap-1"
          >
            <Upload className="h-6 w-6" />
            <span>Load Backup</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}