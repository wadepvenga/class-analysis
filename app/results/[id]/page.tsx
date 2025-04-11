"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AnalysisReport } from "@/components/analysis-report"

export default function AnalysisPage() {
  const params = useParams()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        setLoading(true)
        const id = Array.isArray(params.id) ? params.id[0] : params.id
        
        // Usar a nova rota de API
        const response = await fetch(`/api/get-analysis/${id}`)
        
        if (!response.ok) {
          throw new Error("Falha ao buscar análise")
        }
        
        const result = await response.json()
        console.log("Dados da análise:", result)
        setData(result)
      } catch (err) {
        console.error("Erro ao buscar análise:", err)
        setError("Não foi possível carregar a análise. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchAnalysis()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Carregando análise...</h2>
          <p className="text-muted-foreground">Isso pode levar alguns instantes.</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Erro na Análise</h2>
          <p className="text-muted-foreground">{error || "Não foi possível carregar a análise."}</p>
        </div>
      </div>
    )
  }

  return (
    <AnalysisReport
      analysis={data.analysis}
      transcript={data.transcript || ""}
      timestamp={data.timestamp}
      videoUrl={data.videoUrl}
      metadata={data.metadata}
    />
  )
} 