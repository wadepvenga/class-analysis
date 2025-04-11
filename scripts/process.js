const { exec } = require("child_process")
const { promisify } = require("util")
const fs = require("fs").promises
const fsSync = require("fs")
const path = require("path")

const execAsync = promisify(exec)

async function processFiles(id) {
  const uploadDir = path.join(process.cwd(), "uploads", id)
  const videoPath = path.join(uploadDir, "video.mp4")
  const pdfPath = path.join(uploadDir, "pdf.pdf")
  const proceduresPath = path.join(uploadDir, "procedures.txt")
  const configPath = path.join(uploadDir, "config.json")
  const resultsPath = path.join(uploadDir, "results.json")

  try {
    // Verificar se os arquivos existem
    console.log("Verificando arquivos em:", uploadDir)
    
    if (!fsSync.existsSync(videoPath)) {
      throw new Error(`Arquivo de vídeo não encontrado: ${videoPath}`)
    }
    
    if (!fsSync.existsSync(pdfPath)) {
      throw new Error(`Arquivo PDF não encontrado: ${pdfPath}`)
    }
    
    if (!fsSync.existsSync(proceduresPath)) {
      throw new Error(`Arquivo de procedures não encontrado: ${proceduresPath}`)
    }
    
    if (!fsSync.existsSync(configPath)) {
      throw new Error(`Arquivo de configuração não encontrado: ${configPath}`)
    }

    // Salvar status inicial
    await fs.writeFile(
      resultsPath,
      JSON.stringify({
        status: "processing",
        step: "preparing",
        timestamp: new Date().toISOString(),
      })
    )

    // Ler configuração
    const config = JSON.parse(await fs.readFile(configPath, "utf-8"))
    const { bookType } = config
    
    console.log("Tipo de livro:", bookType)

    try {
      // Carregar o módulo de processamento do Gemini
      const { analyzeClassWithGemini } = require("../lib/server/gemini-client")
      
      // Gerar análise
      console.log("Iniciando análise com Gemini...")
      const analysis = await analyzeClassWithGemini(videoPath, pdfPath, proceduresPath)
      console.log("Análise concluída com sucesso!")

      // Salvar análise
      await fs.writeFile(
        resultsPath,
        JSON.stringify({
          status: "completed",
          analysis,
          timestamp: new Date().toISOString(),
          bookType
        })
      )

      console.log("Processamento concluído com sucesso!")
    } catch (error) {
      console.error("Erro na análise do Gemini:", error)
      
      // Salvar erro
      await fs.writeFile(
        resultsPath,
        JSON.stringify({
          status: "error",
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        })
      )
      
      throw error
    }
  } catch (error) {
    console.error("Erro no processamento:", error)
    
    // Salvar erro se o arquivo de resultados ainda não existir
    if (!fsSync.existsSync(resultsPath)) {
      await fs.writeFile(
        resultsPath,
        JSON.stringify({
          status: "error",
          error: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
        })
      )
    }
    
    throw error
  }
}

// Executar processamento
const id = process.argv[2]
if (!id) {
  console.error("ID não fornecido")
  process.exit(1)
}

processFiles(id).catch(error => {
  console.error("Falha no processamento:", error)
  process.exit(1)
}) 