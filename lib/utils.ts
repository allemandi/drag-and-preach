import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { jsPDF } from "jspdf";
import { Packer, Document, Paragraph, TextRun, HeadingLevel, AlignmentType } from "docx";



export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9)
}


export function formatOutline(sections: Section[], format: "md" | "txt" | "pdf" | "docx"): string {
  switch (format) {
    case "md":
      return formatMarkdown(sections);
    case "txt":
      return formatText(sections);
    case "pdf":
      return formatPdf(sections);
    case "docx":
      return formatDocx(sections);
    default:
      return "";
  }
}

function formatMarkdown(sections: Section[]): string {
  let markdown = "# Sermon Outline\n\n";
  const now = new Date();
  markdown += `*Created: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}*\n\n`;
  markdown += "---\n\n";

  sections.forEach((section) => {
    markdown += `## ${section.title}\n\n`;
    section.blocks.forEach((block) => {
      markdown += `### ${block.label}\n\n`;
      markdown += block.content ? `${block.content}\n\n` : `*${block.placeholder}*\n\n`;
      markdown += "---\n\n";
    });
  });

  return markdown;
}

function formatText(sections: Section[]): string {
  return sections
    .map(section => `${section.title}\n${"=".repeat(section.title.length)}\n\n${section.blocks.map(block => `${block.label}\n${"-".repeat(block.label.length)}\n\n${block.content || block.placeholder
      }\n\n`).join("\n")
      }`).join("\n\n");

      
}

function formatPdf(sections: Section[]): string {
  const doc = new jsPDF();
  let yPos = 20;
  const pageHeight = doc.internal.pageSize.height - 20; // Margin

  // Title
  doc.setFontSize(18);
  doc.text("Sermon Outline", 105, yPos, { align: "center" });
  yPos += 15;

  // Date
  doc.setFontSize(12);
  doc.text(`Created: ${new Date().toLocaleDateString()}`, 105, yPos, { align: "center" });
  yPos += 20;

  // Sections
  doc.setFontSize(14);
  sections.forEach((section) => {
    // Check for page break
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }

    // Section Title
    doc.text(section.title, 20, yPos);
    yPos += 10;

    // Blocks
    doc.setFontSize(12);
    section.blocks.forEach((block) => {
      // Check for page break
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(`• ${block.label}:`, 25, yPos);
      yPos += 7;

      // Split long content
      const lines = doc.splitTextToSize(block.content || block.placeholder, 150);
      lines.forEach((line: string) => {
        if (yPos > pageHeight - 10) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(line, 30, yPos);
        yPos += 7;
      });
      yPos += 10;
    });
    yPos += 10; // Extra space
  });

  // Return as base64 string for PDF
  return doc.output("datauristring");
}

async function formatDocx(sections: Section[]): Promise<string> {
  const children: Paragraph[] = [];

  // Title
  children.push(
    new Paragraph({
      text: "Sermon Outline",
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Date
  children.push(
    new Paragraph({
      text: `Created: ${new Date().toLocaleDateString()}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Sections
  sections.forEach((section) => {
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    // Blocks
    section.blocks.forEach((block) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${block.label}:`,
              bold: true,
            }),
          ],
          spacing: { after: 100 },
        })
      );
      children.push(
        new Paragraph({
          text: block.content || block.placeholder,
          spacing: { after: 200 },
        })
      );
    });
  });

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  return URL.createObjectURL(blob);
}

export async function downloadFile(content: string | Promise<string>, format: string, filename?: string) {
  let url: string;

  if (format === "pdf") {
    url = content as string; // PDF returns base64 string
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `sermon-outline-${new Date().toISOString().split("T")[0]}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } 
  else if (format === "docx") {
    url = await (content as Promise<string>); // DOCX resolves to blob URL
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `sermon-outline-${new Date().toISOString().split("T")[0]}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  else {
    const blob = new Blob([content as string], { type: getMimeType(format) });
    url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || `sermon-outline-${new Date().toISOString().split("T")[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

function getMimeType(format: string): string {
  const types: Record<string, string> = {
    md: "text/markdown",
    txt: "text/plain",
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  };
  return types[format] || "text/plain";
}