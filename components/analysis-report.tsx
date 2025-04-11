"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Download, Play, FileText, Info, BarChart, MessageSquare, CheckCircle2, AlertCircle } from "lucide-react"
import { jsPDF } from "jspdf"
import React from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts"
import ReactMarkdown from "react-markdown"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"

interface AnalysisReportProps {
  analysis: string
  transcript: string
  timestamp: string
  videoUrl?: string
  metadata?: {
    modality: string
    book: string
    classNumber: string
    teacherName: string
  }
}

const COLORS = ["#2E7BEE", "#FFD700", "#FF6B6B", "#4CAF50"]

export function AnalysisReport({ analysis, transcript, timestamp, videoUrl, metadata }: AnalysisReportProps) {
  if (!analysis) return null

  // Função para extrair gráficos do markdown
  const extractCharts = (text: string) => {
    const charts: { title: string; data: { name: string; value: number }[] }[] = []
    const regex = /```mermaid\npie\s+title\s+(.*?)\n([\s\S]*?)```/g
    let match

    while ((match = regex.exec(text)) !== null) {
      const title = match[1]
      const data = match[2]
        .split("\n")
        .filter(line => line.includes(":"))
        .map(line => {
          const [name, value] = line.split(":").map(s => s.trim().replace(/"/g, ""))
          return { name, value: parseInt(value) }
        })
      charts.push({ title, data })
    }

    return charts
  }

  // Função para processar o conteúdo do tópico
  const processContent = (content: string) => {
    // Remove os blocos mermaid
    content = content.replace(/```mermaid[\s\S]*?```/g, "")
    // Remove o texto inicial "Absolutamente!"
    content = content.replace(/^Absolutamente!.*?\n/, "")
    // Remove a seção de gráficos
    content = content.replace(/##\s*Gráficos[\s\S]*?(?=##|$)/, "")
    // Limpa linhas vazias extras
    content = content.replace(/\n{3,}/g, "\n\n")
    return content
  }

  // Extrai as seções principais
  const sections = analysis.split("##").filter(Boolean).map(section => {
    const lines = section.trim().split("\n")
    const title = lines[0].trim()
    const content = lines.slice(1).join("\n").trim()
    // Filtra seções que não são gráficos
    if (!title.toLowerCase().includes("gráfico")) {
      return { title, content }
    }
    return null
  }).filter(Boolean)

  const charts = extractCharts(analysis)

  // Função para calcular o progresso baseado no conteúdo
  const calculateProgress = (content: string) => {
    if (content.toLowerCase().includes("excelente")) return 100
    if (content.toLowerCase().includes("bom")) return 75
    if (content.toLowerCase().includes("adequado")) return 50
    return 25
  }

  // Função para exportar PDF
  const exportToPDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 20
    const lineHeight = 7
    let y = margin

    // Adiciona título
    doc.setFontSize(20)
    doc.text("Análise da Aula", pageWidth / 2, y, { align: "center" })
    y += lineHeight * 2

    // Adiciona metadados
    if (metadata) {
      doc.setFontSize(12)
      doc.text(`Modalidade: ${metadata.modality}`, margin, y)
      y += lineHeight
      doc.text(`Livro: ${metadata.book}`, margin, y)
      y += lineHeight
      doc.text(`Aula: ${metadata.classNumber}`, margin, y)
      y += lineHeight
      doc.text(`Professor: ${metadata.teacherName}`, margin, y)
      y += lineHeight * 2
    }

    // Adiciona data
    doc.text(`Gerado em: ${new Date(timestamp).toLocaleString()}`, margin, y)
    y += lineHeight * 2

    // Adiciona seções
    doc.setFontSize(14)
    sections.forEach(section => {
      if (section) {
        // Adiciona título da seção
        doc.text(section.title, margin, y)
        y += lineHeight

        // Adiciona conteúdo
        doc.setFontSize(12)
        const content = processContent(section.content)
        const lines = doc.splitTextToSize(content, pageWidth - 2 * margin)
        lines.forEach(line => {
          if (y > doc.internal.pageSize.getHeight() - margin) {
            doc.addPage()
            y = margin
          }
          doc.text(line, margin, y)
          y += lineHeight
        })
        y += lineHeight
      }
    })

    // Adiciona transcrição
    if (transcript) {
      doc.addPage()
      y = margin
      doc.setFontSize(14)
      doc.text("Transcrição da Aula", margin, y)
      y += lineHeight * 2
      doc.setFontSize(12)
      const lines = doc.splitTextToSize(transcript, pageWidth - 2 * margin)
      lines.forEach(line => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage()
          y = margin
        }
        doc.text(line, margin, y)
        y += lineHeight
      })
    }

    // Salva o PDF
    doc.save(`analise-aula-${new Date().toISOString().split("T")[0]}.pdf`)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Análise da Aula</h1>
            <p className="text-muted-foreground mt-1">Gerado em {new Date(timestamp).toLocaleString()}</p>
          </div>
          <Button onClick={exportToPDF} className="gap-2">
            <Download className="h-4 w-4" />
            Exportar PDF
          </Button>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1 space-y-6">
            {/* Detalhes da Aula */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Detalhes da Aula</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {metadata && (
                  <>
                    <div>
                      <Badge variant="outline" className="mb-2">{metadata.modality}</Badge>
                      <h3 className="text-xl font-semibold">{metadata.book}</h3>
                      <p className="text-sm text-muted-foreground">Aula {metadata.classNumber}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Professor</p>
                      <p className="text-base">{metadata.teacherName}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Gráficos */}
            {charts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium">Métricas da Aula</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {charts.map((chart, index) => (
                    <div key={index}>
                      <p className="text-sm font-medium mb-2">{chart.title}</p>
                      <div className="h-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={chart.data}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {chart.data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="md:col-span-3 space-y-6">
            {/* Video Preview */}
            {videoUrl && (
              <Card>
                <CardContent className="p-0">
                  <video src={videoUrl} controls className="w-full rounded-lg" />
                </CardContent>
              </Card>
            )}

            {/* Analysis Sections */}
            <div className="space-y-6">
              {sections.map((section, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-muted/50">
                    <div className="flex items-center gap-2">
                      {section.content.toLowerCase().includes("excelente") ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      )}
                      <CardTitle className="text-lg font-medium">{section.title}</CardTitle>
                    </div>
                    <Progress value={calculateProgress(section.content)} className="h-1 mt-2" />
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="prose prose-slate max-w-none">
                      <ReactMarkdown>{processContent(section.content)}</ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Transcript */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Transcrição da Aula</CardTitle>
                <CardDescription>Transcrição completa do áudio</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="prose prose-slate max-w-none">
                    <ReactMarkdown>{transcript}</ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
