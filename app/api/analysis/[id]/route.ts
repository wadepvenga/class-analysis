import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

// Explicitly set the runtime to nodejs
export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    
    if (!id) {
      throw new Error("ID não fornecido")
    }

    console.log(`Fetching analysis for ID: ${id}`)
    const resultsPath = join(process.cwd(), "uploads", id, "results.json")
    console.log(`Looking for results at: ${resultsPath}`)

    try {
      const results = await readFile(resultsPath, "utf-8")
      return NextResponse.json(JSON.parse(results))
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        return NextResponse.json(
          { error: "Análise ainda em processamento" },
          { status: 202 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error("Error fetching analysis:", error)
    return NextResponse.json(
      { 
        error: "Erro ao buscar análise",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
