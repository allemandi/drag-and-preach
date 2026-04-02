"use client";

import Link from "next/link";
import { CircleHelp } from "lucide-react";
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
              <path d="M9 18c-4.51 2-5-2-7-2" />
            </svg>
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
              <CircleHelp className="h-4 w-4" />
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
