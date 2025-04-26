"use client";

import Link from "next/link";
import { Github, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Footer() {
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);

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

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => setIsHelpModalOpen(true)}
          aria-label="Help"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </footer>

      {isHelpModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsHelpModalOpen(false)}
        >
          <div
            className="bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-4">Help & Instructions</h2>
            <div className="space-y-4">
              <p>Welcome to Drag and Preach! Here's a quick guide:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Drag by the grip icons (⋮⋮) to reorder sections and blocks.</li>
                <li>Click any title or textbox to edit text.</li>
                <li>Export your outline using the toolbar (PDF, DOCX, TXT, Markdown).</li>
                <li>Remember to Save and Backup regularly!</li>
              </ul>
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setIsHelpModalOpen(false)}>
                Close
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}