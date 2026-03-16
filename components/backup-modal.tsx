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
        <Button variant="pastel-green" className="flex-1 sm:flex-none h-12 px-8">
          <Database className="h-5 w-5 sm:mr-2" />
          <span className="font-semibold">Backup</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-2 border-pastel-border-green p-8 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black text-center mb-8 tracking-tight">Backup Options</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-5 mt-2">
          <Button
            onClick={() => handleAction(onDownload)}
            variant="pastel-blue"
            className="w-full h-24 text-xl font-bold flex flex-col items-center justify-center gap-2 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Download className="h-8 w-8" />
            <span>Download Backup</span>
          </Button>
          <Button
            onClick={() => handleAction(onUpload)}
            variant="pastel-amber"
            className="w-full h-24 text-xl font-bold flex flex-col items-center justify-center gap-2 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all"
          >
            <Upload className="h-8 w-8" />
            <span>Load Backup</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}