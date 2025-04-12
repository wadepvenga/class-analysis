import { NextRequest, NextResponse } from "next/server"
import { uploadFilesToSupabase } from "@/lib/upload-service"
import { processFilesAction } from "@/lib/server/process-files"

// Explicitly set the runtime to nodejs
export const runtime = "nodejs"

// This file only runs on the server
export async function POST(request: NextRequest) {
  try {
    console.log("API de upload iniciada", { environment: process.env.NODE_ENV, uploadDir: process.env.UPLOAD_DIR })
    const formData = await request.formData()
    console.log("FormData recebido", { 
      hasVideo: !!formData.get("video"), 
      hasPDF: !!formData.get("pdf"),
      keys: [...formData.keys()]
    })
    
    const video = formData.get("video") as File
    const pdf = formData.get("pdf") as File
    const modality = formData.get("modality") as string
    const book = formData.get("book") as string
    const classNumber = formData.get("classNumber") as string
    const teacherName = formData.get("teacherName") as string

    if (!video || !pdf) {
      console.log("Arquivos obrigatórios ausentes", { video: !!video, pdf: !!pdf })
      return NextResponse.json(
        { error: "Vídeo e PDF são obrigatórios" },
        { status: 400 }
      )
    }

    console.log(`Recebido arquivo de vídeo: ${video.name}, tamanho: ${video.size} bytes, tipo: ${video.type}`)
    console.log(`Recebido arquivo PDF: ${pdf.name}, tamanho: ${pdf.size} bytes, tipo: ${pdf.type}`)

    // Upload files to Supabase Storage
    const result = await uploadFilesToSupabase(video, pdf)
    console.log("Arquivos enviados para o Supabase:", result)

    // Process files
    try {
      await processFilesAction({
        id: result.id,
        videoPath: result.videoUrl,
        pdfPath: result.pdfUrl,
        videoName: video.name,
        pdfName: pdf.name,
        metadata: {
          modality,
          book,
          classNumber,
          teacherName
        }
      })
    } catch (processError) {
      console.error("Erro ao processar arquivos, mas o upload foi realizado:", processError)
      // Continuaremos mesmo com erro no processamento, pois os arquivos já foram enviados
    }

    return NextResponse.json({ id: result.id })
  } catch (error) {
    console.error("Error processing upload:", error)
    return NextResponse.json(
      { 
        error: "Erro ao processar o upload",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
