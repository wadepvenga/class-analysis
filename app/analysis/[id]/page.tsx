"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AnalysisReport } from "@/components/analysis-report"
import type { AnalysisData } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function AnalysisPage() {
  const { id } = useParams() as { id: string }
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        console.log("Fetching analysis for ID:", id)
        const response = await fetch(`/api/analysis/${id}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Failed to fetch analysis (Status: ${response.status})`)
        }

        const data = await response.json()
        console.log("Analysis data received:", data)
        setAnalysisData(data)
      } catch (err) {
        console.error("Error fetching analysis:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysis()

    // Poll for updates if the analysis is still processing
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/analysis/${id}`)
        if (!response.ok) return

        const data = await response.json()
        setAnalysisData(data)

        // Stop polling once the analysis is complete or has errored
        if (data.status !== "processing") {
          clearInterval(interval)
        }
      } catch (error) {
        console.error("Error polling for analysis:", error)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [id])

  if (loading) {
    return (
      <div className="container mx-auto max-w-5xl py-12">
        <Card className="border-neon-blue">
          <CardHeader>
            <CardTitle className="text-neon-blue">Carregando Análise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">Recuperando os resultados da sua análise...</p>
            <Progress className="h-2 w-full bg-secondary [&>div]:bg-neon-blue" value={undefined} />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-5xl py-12">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Erro ao Carregar Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-destructive">{error}</p>
            <p className="text-muted-foreground">
              Tente novamente mais tarde ou entre em contato com o suporte se o problema persistir.
            </p>
            <p className="text-sm text-muted-foreground">ID da Análise: {id}</p>
            <Button onClick={() => router.push("/")} className="bg-neon-blue hover:bg-neon-blue/80 text-black">
              Voltar para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!analysisData) {
    return (
      <div className="container mx-auto max-w-5xl py-12">
        <Card className="border-neon-blue">
          <CardHeader>
            <CardTitle className="text-neon-blue">Análise Não Encontrada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">A análise solicitada não pôde ser encontrada.</p>
            <Button onClick={() => router.push("/")} className="bg-neon-blue hover:bg-neon-blue/80 text-black">
              Voltar para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (analysisData.status === "processing") {
    const step = analysisData.step || "preparing"
    let stepMessage = "Preparando para análise..."
    let progress = 10

    if (step === "extracting_pdf") {
      stepMessage = "Extraindo texto do guia PDF..."
      progress = 30
    } else if (step === "transcribing_video") {
      stepMessage = "Transcrevendo conteúdo do vídeo com Gemini..."
      progress = 60
    } else if (step === "analyzing_content") {
      stepMessage = "Analisando conteúdo da aula com Gemini..."
      progress = 85
    }

    return (
      <div className="container mx-auto max-w-5xl py-12">
        <Card className="border-neon-blue">
          <CardHeader>
            <CardTitle className="text-neon-blue">Análise em Andamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{stepMessage}</p>
            <Progress value={progress} className="h-2 w-full bg-secondary [&>div]:bg-neon-blue" />
            <p className="text-sm text-muted-foreground">ID da Análise: {id}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (analysisData.status === "error") {
    return (
      <div className="container mx-auto max-w-5xl py-12">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erro na Análise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-destructive">{analysisData.error || "Ocorreu um erro durante a análise."}</p>
            <Button onClick={() => router.push("/")} className="bg-neon-blue hover:bg-neon-blue/80 text-black">
              Voltar para o início
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-5xl py-12">
      <AnalysisReport 
        analysis={analysisData.result || ""} 
        transcript={analysisData.transcript} 
        timestamp={analysisData.timestamp} 
        videoUrl={analysisData.videoUrl} 
        metadata={analysisData.metadata}
      />
    </div>
  )
}
