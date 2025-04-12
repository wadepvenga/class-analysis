"use server"

import { writeFile } from "fs/promises"
import { join } from "path"
import { analyzeClassWithGemini } from "./gemini-client"
import { existsSync } from "fs"

interface ProcessFilesParams {
  id: string
  videoPath: string
  pdfPath: string
  videoName: string
  pdfName: string
}

export async function processFilesAction(params: ProcessFilesParams) {
  const { id, videoPath, pdfPath } = params
  
  try {
    console.log("Enviando vídeo e PDF para análise pelo Gemini...")
    console.log(`Caminho do vídeo: ${videoPath}`)
    console.log(`Caminho do PDF: ${pdfPath}`)

    const analysis = await analyzeClassWithGemini(videoPath, pdfPath)
    
    // Save results in the project's uploads directory
    const resultsPath = join(process.cwd(), "uploads", id, "results.json")
    await writeFile(
      resultsPath,
      JSON.stringify({
        status: "completed",
        timestamp: new Date().toISOString(),
        result: analysis,
      })
    )

    return analysis
  } catch (error) {
    console.error("Error processing files:", error)
    throw new Error(`Erro ao processar arquivos: ${error instanceof Error ? error.message : String(error)}`)
  }
}
