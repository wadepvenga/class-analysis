import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { existsSync } from "fs"
import { join } from "path"

// Explicitamente definir o runtime como nodejs
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    // Extrair o ID diretamente da URL
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const id = pathParts[pathParts.length - 1]
    
    console.log(`Buscando análise para ID: ${id}`)
    const resultsPath = join(process.cwd(), "uploads", id, "results.json")
    console.log(`Procurando resultados em: ${resultsPath}`)

    if (!existsSync(resultsPath)) {
      console.error(`Arquivo de resultados não encontrado: ${resultsPath}`)
      return NextResponse.json(
        { error: "Análise não encontrada" },
        { status: 404 }
      )
    }

    const results = await readFile(resultsPath, "utf-8")
    return NextResponse.json(JSON.parse(results))
  } catch (error) {
    console.error("Erro ao buscar análise:", error)
    return NextResponse.json(
      { error: "Erro ao buscar análise" },
      { status: 500 }
    )
  }
} 