"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, Video } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileUploader } from "./file-uploader"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { COURSE_BOOKS, COURSE_MODALITIES, CourseModality } from "@/lib/types"

export function UploadForm() {
  const router = useRouter()
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [selectedModality, setSelectedModality] = useState<CourseModality>("Adults")
  const [selectedBook, setSelectedBook] = useState("")
  const [classNumber, setClassNumber] = useState("")
  const [teacherName, setTeacherName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted")
    console.log("Video file:", videoFile)
    console.log("PDF file:", pdfFile)
    console.log("Modality:", selectedModality)
    console.log("Book:", selectedBook)
    console.log("Class number:", classNumber)
    console.log("Teacher:", teacherName)

    if (!videoFile || !pdfFile) {
      console.log("Missing files")
      setError("Por favor, faça upload do vídeo da aula e do guia do professor em PDF")
      return
    }

    if (!selectedModality || !selectedBook || !classNumber || !teacherName) {
      setError("Por favor, preencha todos os campos de cadastro")
      return
    }

    // Verificar tamanho do arquivo
    const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB
    if (videoFile.size > MAX_FILE_SIZE) {
      setError(
        `O arquivo de vídeo excede o tamanho máximo permitido (500MB). Tamanho atual: ${(videoFile.size / (1024 * 1024)).toFixed(2)}MB`,
      )
      return
    }

    // Verificar tipo de arquivo
    const validVideoTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"]
    if (!validVideoTypes.includes(videoFile.type)) {
      setError(`Tipo de arquivo de vídeo não suportado: ${videoFile.type}. Por favor, use MP4, MOV, AVI ou WebM.`)
      return
    }

    if (pdfFile.type !== "application/pdf") {
      setError("O guia do professor deve estar em formato PDF.")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Simular progress para melhor UX
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 5
        })
      }, 300)

      const formData = new FormData()
      formData.append("video", videoFile)
      formData.append("pdf", pdfFile)
      formData.append("modality", selectedModality)
      formData.append("book", selectedBook)
      formData.append("classNumber", classNumber)
      formData.append("teacherName", teacherName)

      console.log(`Enviando arquivo de vídeo: ${videoFile.name} (${videoFile.size} bytes, tipo: ${videoFile.type})`)
      console.log(`Enviando arquivo PDF: ${pdfFile.name} (${pdfFile.size} bytes, tipo: ${pdfFile.type})`)

      // Detectar se estamos no Netlify
      const isNetlify = window.location.hostname.includes('netlify.app')
      const uploadUrl = isNetlify 
        ? '/.netlify/functions/upload' 
        : '/api/upload'
      
      console.log(`Usando endpoint de upload: ${uploadUrl}`)

      const response = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("Detalhes do erro:", errorData)
        throw new Error(errorData.error || errorData.details || `Upload failed with status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Response data:", data)
      const analysisId = data.id
      console.log("Analysis ID:", analysisId)

      clearInterval(progressInterval)
      setProgress(100)

      // Navigate to results page with a delay to ensure state is updated
      if (analysisId) {
        console.log("Redirecting to:", `/analysis/${analysisId}`)
        setTimeout(() => {
          router.push(`/analysis/${analysisId}`)
        }, 1500)
      } else {
        console.error("No analysis ID received from server")
        throw new Error("No analysis ID received from server")
      }
    } catch (err) {
      console.error("Upload error:", err)
      setError(err instanceof Error ? err.message : "Ocorreu um erro durante o upload")
      setIsUploading(false)
      setProgress(0)
    }
  }

  return (
    <Card className="w-full border-neon-blue bg-black/50">
      <CardHeader className="bg-gradient-to-r from-neon-blue/10 to-neon-yellow/10">
        <CardTitle className="neon-text-blue">Upload de Arquivos</CardTitle>
        <CardDescription>
          Faça upload do vídeo da sua aula e do guia do professor em PDF para iniciar a análise
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <h3 className="text-cyan-500 mb-4 font-medium">Arquivos da Aula</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <FileUploader
                icon={<Video className="h-6 w-6 text-neon-blue" />}
                title="Vídeo da Aula"
                description="Faça upload da gravação da sua aula (MP4, MOV, etc.)"
                accept="video/*"
                file={videoFile}
                setFile={setVideoFile}
                disabled={isUploading}
                color="blue"
              />

              <FileUploader
                icon={<FileText className="h-6 w-6 text-neon-yellow" />}
                title="Guia do Professor"
                description="Faça upload do guia do professor (PDF)"
                accept=".pdf"
                file={pdfFile}
                setFile={setPdfFile}
                disabled={isUploading}
                color="yellow"
              />
            </div>
          </div>

          <div>
            <h3 className="text-cyan-500 mb-4 font-medium">Informações da Aula</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-cyan-500">Modalidade</Label>
                <Select
                  value={selectedModality}
                  onValueChange={(value: CourseModality) => {
                    setSelectedModality(value)
                    setSelectedBook("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_MODALITIES.map((modality) => (
                      <SelectItem key={modality} value={modality}>
                        {modality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-cyan-500">Livro</Label>
                <Select value={selectedBook} onValueChange={setSelectedBook}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o livro" />
                  </SelectTrigger>
                  <SelectContent>
                    {COURSE_BOOKS[selectedModality].map((book) => (
                      <SelectItem key={book} value={book}>
                        {book}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classNumber" className="text-cyan-500">Aula</Label>
                <Input
                  id="classNumber"
                  type="text"
                  placeholder="Ex: Unit 1 Part A"
                  value={classNumber}
                  onChange={(e) => setClassNumber(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="teacherName" className="text-cyan-500">Nome do Professor</Label>
                <Input
                  id="teacherName"
                  placeholder="Nome do professor"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                />
              </div>
            </div>
          </div>

          {error && <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">{error}</div>}

          {isUploading && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 w-full bg-secondary [&>div]:bg-neon-blue" />
              <p className="text-sm text-muted-foreground">
                {progress < 100 ? "Processando arquivos..." : "Análise completa!"}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-neon-blue hover:bg-neon-blue/80 text-black font-bold"
            disabled={isUploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? "Processando..." : "Analisar Aula"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Formatos de vídeo suportados: MP4, MOV, AVI</p>
        <p>Tamanho máximo: 500MB</p>
      </CardFooter>
    </Card>
  )
}
