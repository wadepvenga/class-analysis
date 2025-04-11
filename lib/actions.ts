"use server"

import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import { writeFile } from "fs/promises"
import path from "path"
import { mkdir } from "fs/promises"

import { transcribeVideo } from "@/lib/transcription"
import { extractTextFromPdf } from "@/lib/pdf-parser"
import { analyzeClassContent } from "@/lib/analysis"

export async function uploadFiles(formData: FormData): Promise<string> {
  try {
    // Generate a unique ID for this analysis
    const analysisId = uuidv4()

    // Create directory for this analysis
    const analysisDir = path.join(process.cwd(), "uploads", analysisId)
    await mkdir(analysisDir, { recursive: true })

    // Get files from form data
    const videoFile = formData.get("video") as File
    const pdfFile = formData.get("pdf") as File

    if (!videoFile || !pdfFile) {
      throw new Error("Missing required files")
    }

    // Save files to disk
    const videoPath = path.join(analysisDir, videoFile.name)
    const pdfPath = path.join(analysisDir, pdfFile.name)

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer())
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())

    await writeFile(videoPath, videoBuffer)
    await writeFile(pdfPath, pdfBuffer)

    // Process files asynchronously
    // In a production app, you'd want to use a queue system for this
    processFiles(analysisId, videoPath, pdfPath).catch(console.error)

    return analysisId
  } catch (error) {
    console.error("Error uploading files:", error)
    throw new Error("Failed to upload files")
  }
}

async function processFiles(analysisId: string, videoPath: string, pdfPath: string) {
  try {
    // Step 1: Transcribe video
    const transcript = await transcribeVideo(videoPath)

    // Step 2: Extract text from PDF
    const guideText = await extractTextFromPdf(pdfPath)

    // Step 3: Analyze content
    const analysisResults = await analyzeClassContent(transcript, guideText)

    // Step 4: Save results
    const resultsPath = path.join(process.cwd(), "uploads", analysisId, "results.json")
    await writeFile(
      resultsPath,
      JSON.stringify({
        transcript,
        guideText,
        analysis: analysisResults,
        timestamp: new Date().toISOString(),
      }),
    )

    // Update cache for the analysis page
    revalidatePath(`/analysis/${analysisId}`)
  } catch (error) {
    console.error("Error processing files:", error)
    // In a production app, you'd want to update the status in a database
  }
}
