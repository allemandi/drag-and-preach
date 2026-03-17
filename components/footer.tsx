"use client";

import Link from "next/link";
import { Github, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Footer() {
  return (
    <div className="footer-container">
      <footer className="fixed bottom-0 left-0 w-full py-2 px-4 bg-background border-t border-border flex justify-center items-center gap-6 z-40">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} allemandi
        </p>

        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
          <Link
            href="https://github.com/allemandi/drag-and-preach"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </Link>
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Help"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl border p-6 shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center mb-4 tracking-tight">Help & Instructions</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Welcome to Drag and Preach! Here&apos;s a quick guide:</p>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>Drag by the grip icons (⋮⋮) to reorder sections and blocks.</li>
                <li>Click any title or textbox to edit text.</li>
                <li>Export your outline using the toolbar (PDF, DOCX, TXT, Markdown).</li>
                <li>Remember to Save and Backup regularly!</li>
              </ul>
            </div>
            <DialogFooter className="mt-6 flex justify-end">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </footer>
    </div>
  );
}
