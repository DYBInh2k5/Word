"use client";

import { Editor } from "@tiptap/react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function exportToPDF(editor: Editor, title: string): Promise<void> {
  const element = document.querySelector(".page-canvas") as HTMLElement;
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = imgWidth / imgHeight;
  const height = pdfWidth / ratio;

  let position = 0;
  let remaining = height;

  pdf.addImage(imgData, "PNG", 0, position, pdfWidth, height);
  remaining -= pdfHeight;
  position -= pdfHeight;

  while (remaining > 0) {
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, pdfWidth, height);
    remaining -= pdfHeight;
    position -= pdfHeight;
  }

  pdf.save(`${title || "document"}.pdf`);
}

export function exportToHTML(editor: Editor, title: string): void {
  const content = editor.getHTML();
  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: 'Times New Roman', serif; max-width: 800px; margin: 40px auto; padding: 0 40px; line-height: 1.8; color: #111; font-size: 14pt; }
    h1 { font-size: 2em; } h2 { font-size: 1.6em; } h3 { font-size: 1.3em; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; }
    blockquote { border-left: 4px solid #2563eb; padding: 8px 16px; background: #f0f4ff; }
    pre { background: #1e1e2e; color: #cdd6f4; padding: 16px; border-radius: 8px; }
    code { background: #f0f0f0; padding: 2px 6px; border-radius: 4px; }
    img { max-width: 100%; }
  </style>
</head>
<body>${content}</body>
</html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title || "document"}.html`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToMarkdown(editor: Editor): string {
  // Simple HTML to Markdown conversion
  let html = editor.getHTML();
  let md = html
    .replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gi, "_$1_")
    .replace(/<i[^>]*>(.*?)<\/i>/gi, "_$1_")
    .replace(/<u[^>]*>(.*?)<\/u>/gi, "$1")
    .replace(/<s[^>]*>(.*?)<\/s>/gi, "~~$1~~")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)")
    .replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n")
    .replace(/<ul[^>]*>|<\/ul>/gi, "\n")
    .replace(/<ol[^>]*>|<\/ol>/gi, "\n")
    .replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, "> $1\n")
    .replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n")
    .replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`")
    .replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return md;
}
