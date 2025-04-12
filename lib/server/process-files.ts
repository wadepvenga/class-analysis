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
  metadata?: {
    modality: string
    book: string
    classNumber: string
    teacherName: string
  }
}

export async function processFilesAction(params: ProcessFilesParams) {
  const { id, videoPath, pdfPath, metadata } = params
  
  try {
    console.log("Enviando vídeo e PDF para análise pelo Gemini...")
    console.log(`Caminho do vídeo: ${videoPath}`)
    console.log(`Caminho do PDF: ${pdfPath}`)
    console.log("Metadados:", metadata)

    const analysis = await analyzeClassWithGemini(videoPath, pdfPath)
    
    // Verificar se estamos em ambiente Netlify
    const isNetlify = process.env.NETLIFY === 'true'
    console.log("Ambiente:", { isNetlify, nodeEnv: process.env.NODE_ENV })
    
    let resultsPath
    
    if (isNetlify) {
      // No Netlify, podemos gravar temporariamente em /tmp
      resultsPath = join('/tmp', id, 'results.json')
    } else {
      // Em ambiente local, gravamos na pasta uploads
      resultsPath = join(process.cwd(), "uploads", id, "results.json")
    }
    
    // Criar o diretório para os resultados, se necessário
    try {
      const { mkdir } = await import('fs/promises')
      const { dirname } = await import('path')
      await mkdir(dirname(resultsPath), { recursive: true })
    } catch (mkdirError) {
      console.error("Erro ao criar diretório:", mkdirError)
    }
    
    await writeFile(
      resultsPath,
      JSON.stringify({
        status: "completed",
        timestamp: new Date().toISOString(),
        result: analysis,
        metadata
      })
    )

    return analysis
  } catch (error) {
    console.error("Error processing files:", error)
    throw new Error(`Erro ao processar arquivos: ${error instanceof Error ? error.message : String(error)}`)
  }
}
