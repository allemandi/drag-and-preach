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

  const handleDownload = () => {
    onDownload();
    setIsOpen(false);
  };

  const handleUpload = () => {
    onUpload();
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
      <DialogContent className="sm:max-w-[425px] rounded-xl border-2 border-pastel-border-green">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center mb-4">Backup Options</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-2">
          <Button onClick={handleDownload} variant="pastel-blue" className="w-full h-16 text-lg">
            <Download className="h-5 w-5 mr-2" />
            Download Backup
          </Button>
          <Button onClick={handleUpload} variant="pastel-amber" className="w-full h-16 text-lg">
            <Upload className="h-5 w-5 mr-2" />
            Load Backup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}