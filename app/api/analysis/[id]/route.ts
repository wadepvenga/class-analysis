import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

// Explicitly set the runtime to nodejs
export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  console.log(`Fetching analysis for ID: ${id}`)
  
  try {
    const resultsPath = join(process.cwd(), "uploads", id, "results.json")
    console.log(`Looking for results at: ${resultsPath}`)

    try {
      const results = await readFile(resultsPath, "utf-8")
      const parsedResults = JSON.parse(results)
      console.log("Results found:", parsedResults)
      return NextResponse.json(parsedResults)
    } catch (error: any) {
      if (error?.code === 'ENOENT') {
        console.log("Results file not found, analysis still processing")
        return NextResponse.json(
          { 
            status: "processing",
            error: "Análise ainda em processamento" 
          },
          { status: 202 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error("Error fetching analysis:", error)
    return NextResponse.json(
      { 
        status: "error",
        error: "Erro ao buscar análise",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
