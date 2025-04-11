import { NextRequest, NextResponse } from "next/server"
import { mkdir, writeFile } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { processFilesAction } from "@/lib/server/process-files"

// Explicitly set the runtime to nodejs
export const runtime = "nodejs"

// This file only runs on the server
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const video = formData.get("video") as File
    const pdf = formData.get("pdf") as File

    if (!video || !pdf) {
      return NextResponse.json(
        { error: "Vídeo e PDF são obrigatórios" },
        { status: 400 }
      )
    }

    console.log(`Recebido arquivo de vídeo: ${video.name}, tamanho: ${video.size} bytes, tipo: ${video.type}`)
    console.log(`Recebido arquivo PDF: ${pdf.name}, tamanho: ${pdf.size} bytes, tipo: ${pdf.type}`)

    const id = uuidv4()
    const uploadDir = join("/tmp", "uploads", id)
    
    await mkdir(uploadDir, { recursive: true })

    const videoPath = join(uploadDir, video.name)
    const pdfPath = join(uploadDir, pdf.name)

    const videoBuffer = Buffer.from(await video.arrayBuffer())
    const pdfBuffer = Buffer.from(await pdf.arrayBuffer())

    await writeFile(videoPath, videoBuffer)
    await writeFile(pdfPath, pdfBuffer)

    console.log(`Arquivos salvos em: ${uploadDir}`)
    console.log(`Caminho do vídeo: ${videoPath}`)
    console.log(`Caminho do PDF: ${pdfPath}`)

    // Process the files
    await processFilesAction({
      id,
      videoPath,
      pdfPath,
      videoName: video.name,
      pdfName: pdf.name,
    })

    return NextResponse.json({ id })
  } catch (error) {
    console.error("Error processing upload:", error)
    return NextResponse.json(
      { error: "Erro ao processar o upload" },
      { status: 500 }
    )
  }
}
