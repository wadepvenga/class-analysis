"use server"

import { writeFile } from "fs/promises"
import path from "path"
import { analyzeClassWithGemini } from "./gemini-client"
import { existsSync } from "fs"

export async function processFilesAction(analysisId: string, videoPath: string, pdfPath: string, metadata?: {
  modality: string
  book: string
  classNumber: string
  teacherName: string
}) {
  try {
    console.log("Iniciando processamento dos arquivos...")
    console.log("Analysis ID:", analysisId)
    console.log("Video Path:", videoPath)
    console.log("PDF Path:", pdfPath)
    console.log("Metadata:", metadata)

    // Verificar se os arquivos existem
    if (!videoPath || !pdfPath) {
      throw new Error("Caminhos dos arquivos não fornecidos")
    }

    if (!existsSync(videoPath)) {
      throw new Error(`Arquivo de vídeo não encontrado: ${videoPath}`)
    }

    if (!existsSync(pdfPath)) {
      throw new Error(`Arquivo PDF não encontrado: ${pdfPath}`)
    }

    // Create results directory path
    const resultsPath = path.join(process.cwd(), "uploads", analysisId, "results.json")

    // Update status to processing
    await writeFile(
      resultsPath,
      JSON.stringify({
        status: "processing",
        step: "starting",
        timestamp: new Date().toISOString(),
        metadata
      }),
    )

    // Atualizar status para processamento de vídeo e PDF
    await writeFile(
      resultsPath,
      JSON.stringify({
        status: "processing",
        step: "analyzing_content",
        timestamp: new Date().toISOString(),
        metadata
      }),
    )

    console.log("Enviando vídeo e PDF para análise pelo Gemini...")
    console.log(`Caminho do vídeo: ${videoPath}`)
    console.log(`Caminho do PDF: ${pdfPath}`)

    // Enviar vídeo e PDF diretamente para o Gemini para análise
    const analysisResponse = await analyzeClassWithGemini(videoPath, pdfPath)

    console.log("Análise concluída pelo Gemini")

    // Extrair a transcrição do vídeo - usando uma expressão regular mais precisa
    const transcriptMatch = analysisResponse.match(/## Transcrição do Vídeo\n\n([\s\S]*?)(?=\n\n## Informações Gerais|$)/)
    const transcript = transcriptMatch ? transcriptMatch[1].trim() : "Transcrição não disponível"

    // Remover a seção de transcrição do relatório de análise
    const analysis = analysisResponse.replace(/## Transcrição do Vídeo\n\n[\s\S]*?(?=\n\n## Informações Gerais|$)/, "")

    // Salvar a resposta completa
    await writeFile(
      resultsPath,
      JSON.stringify({
        status: "completed",
        transcript,
        analysis,
        timestamp: new Date().toISOString(),
        metadata
      }),
    )

    return { success: true }
  } catch (error) {
    console.error("Error processing files:", error)

    // Save error status
    const resultsPath = path.join(process.cwd(), "uploads", analysisId, "results.json")
    await writeFile(
      resultsPath,
      JSON.stringify({
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
        metadata
      }),
    )

    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}
