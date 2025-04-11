import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"

// Explicitly set the runtime to nodejs
export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const id = context.params.id
    
    if (!id) {
      throw new Error("ID não fornecido")
    }

    console.log(`Fetching analysis for ID: ${id}`)
    const resultsPath = join(process.cwd(), "uploads", id, "results.json")
    console.log(`Looking for results at: ${resultsPath}`)

    const results = await readFile(resultsPath, "utf-8")
    return NextResponse.json(JSON.parse(results))
  } catch (error) {
    console.error("Error fetching analysis:", error)
    return NextResponse.json(
      { error: "Análise não encontrada" },
      { status: 404 }
    )
  }
}
