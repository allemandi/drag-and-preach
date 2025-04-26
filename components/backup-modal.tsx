"use client";

import { Download, Upload } from "lucide-react";
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
        <Button variant="outline" className="flex-1 sm:flex-none">
          <Download className="h-4 w-4 sm:mr-2" />
          <span>Backup</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Backup Options</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 mt-4">
          <Button onClick={handleDownload} variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Backup
          </Button>
          <Button onClick={handleUpload} variant="outline" className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            Load Backup
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}