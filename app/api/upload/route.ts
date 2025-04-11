import { type NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { processFilesAction } from "@/lib/server/process-files"

// Explicitly set the runtime to nodejs
export const runtime = "nodejs"

// This file only runs on the server
export async function POST(request: NextRequest) {
  try {
    // Generate a unique ID for this analysis
    const analysisId = uuidv4()

    // Create directory for this analysis
    const uploadsDir = path.join(process.cwd(), "uploads")
    const analysisDir = path.join(uploadsDir, analysisId)

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    await mkdir(analysisDir, { recursive: true })

    // Get form data
    const formData = await request.formData()
    const videoFile = formData.get("video") as File
    const pdfFile = formData.get("pdf") as File
    const modality = formData.get("modality") as string
    const book = formData.get("book") as string
    const classNumber = formData.get("classNumber") as string
    const teacherName = formData.get("teacherName") as string

    if (!videoFile || !pdfFile) {
      return NextResponse.json({ error: "Missing required files" }, { status: 400 })
    }

    if (!modality || !book || !classNumber || !teacherName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    console.log(
      `Recebido arquivo de vídeo: ${videoFile.name}, tamanho: ${videoFile.size} bytes, tipo: ${videoFile.type}`,
    )
    console.log(`Recebido arquivo PDF: ${pdfFile.name}, tamanho: ${pdfFile.size} bytes, tipo: ${pdfFile.type}`)
    console.log(`Modalidade: ${modality}`)
    console.log(`Livro: ${book}`)
    console.log(`Número da aula: ${classNumber}`)
    console.log(`Professor: ${teacherName}`)

    // Save files to disk
    const videoPath = path.join(analysisDir, videoFile.name)
    const pdfPath = path.join(analysisDir, pdfFile.name)

    const videoBuffer = Buffer.from(await videoFile.arrayBuffer())
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())

    await writeFile(videoPath, videoBuffer)
    await writeFile(pdfPath, pdfBuffer)

    console.log(`Arquivos salvos em: ${analysisDir}`)
    console.log(`Caminho do vídeo: ${videoPath}`)
    console.log(`Caminho do PDF: ${pdfPath}`)

    // Create a placeholder results file to indicate processing has started
    const resultsPath = path.join(analysisDir, "results.json")
    await writeFile(
      resultsPath,
      JSON.stringify({
        status: "processing",
        timestamp: new Date().toISOString(),
        metadata: {
          modality,
          book,
          classNumber,
          teacherName,
        },
      }),
    )

    // Start processing in the background using a server action
    processFilesAction(analysisId, videoPath, pdfPath, {
      modality,
      book,
      classNumber,
      teacherName,
    }).catch((error) => {
      console.error("Erro ao processar arquivos:", error)
    })

    return NextResponse.json({ analysisId })
  } catch (error) {
    console.error("Error uploading files:", error)
    return NextResponse.json({ error: "Failed to upload files" }, { status: 500 })
  }
}
