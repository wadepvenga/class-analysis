"use server"

import { readFile } from "fs/promises"
import * as pdfjs from "pdfjs-dist"

// Initialize PDF.js worker - this will only run on the server
const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.mjs")
pdfjs.GlobalWorkerOptions.workerSrc = pdfjsWorker

export async function extractTextFromPdf(pdfPath: string): Promise<string> {
  try {
    // Read the PDF file
    const data = await readFile(pdfPath)

    // Load the PDF document
    const loadingTask = pdfjs.getDocument({ data })
    const pdf = await loadingTask.promise

    let fullText = ""

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items.map((item: any) => item.str).join(" ")

      fullText += pageText + "\n"
    }

    return fullText
  } catch (error) {
    console.error("Error extracting text from PDF:", error)
    throw new Error("Failed to extract text from PDF")
  }
}
