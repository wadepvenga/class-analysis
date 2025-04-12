import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { createClient } from '@supabase/supabase-js'

// Inicialize o cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Explicitly set the runtime to nodejs
export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id
  console.log(`Fetching analysis for ID: ${id}`)
  
  try {
    // Primeiro tentamos ler do sistema de arquivos local
    try {
      const isNetlify = process.env.NETLIFY === 'true'
      let resultsPath
      
      if (isNetlify) {
        resultsPath = join('/tmp', id, 'results.json')
      } else {
        resultsPath = join(process.cwd(), "uploads", id, "results.json")
      }
      
      console.log(`Looking for results at: ${resultsPath}`)
      
      try {
        const results = await readFile(resultsPath, "utf-8")
        const parsedResults = JSON.parse(results)
        console.log("Results found in filesystem")
        return NextResponse.json(parsedResults)
      } catch (fsError) {
        // Se não encontrar no sistema de arquivos, continua e tenta no Supabase
        console.log("Results not found in filesystem, trying Supabase")
      }
    } catch (fsError) {
      console.log("Error accessing filesystem:", fsError)
    }
    
    // Tentar buscar do Supabase Storage ou Supabase Database
    try {
      // Primeiro verificar no bucket de análises
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .select('*')
        .eq('id', id)
        .single()
        
      if (analysisData) {
        console.log("Analysis found in Supabase Database")
        return NextResponse.json({
          status: "completed",
          timestamp: analysisData.created_at,
          result: analysisData.analysis,
          metadata: analysisData.metadata
        })
      }
      
      // Se não encontrar na tabela, busca no storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('class-analysis')
        .download(`${id}/results.json`)
        
      if (storageData) {
        const text = await storageData.text()
        console.log("Results found in Supabase Storage")
        return NextResponse.json(JSON.parse(text))
      }
      
      // Se chegou aqui, não encontrou em nenhum lugar
      console.log("Analysis not found in any storage")
      return NextResponse.json(
        { 
          status: "processing",
          error: "Análise ainda em processamento" 
        },
        { status: 202 }
      )
    } catch (supabaseError) {
      console.error("Error accessing Supabase:", supabaseError)
      throw supabaseError
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
