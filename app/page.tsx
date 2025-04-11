"use client"

import { UploadForm } from "@/components/upload-form"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-6 md:p-12 bg-gradient-to-br from-black to-gray-900">
      <div className="mx-auto max-w-5xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-neon-blue">
            Análise de Aulas - Play
          </h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground">
            Faça upload do vídeo da sua aula e do guia do professor para obter análises detalhadas e insights.
          </p>
        </div>
        <UploadForm />
      </div>
    </main>
  )
}
