"use server"

import { GEMINI_CONFIG } from "./gemini-config"
import { readFile } from "fs/promises"

// Função para codificar um arquivo em base64
async function fileToBase64(filePath: string): Promise<string> {
  const buffer = await readFile(filePath)
  return buffer.toString("base64")
}

// Função para determinar o tipo MIME com base na extensão do arquivo
function getMimeType(filePath: string): string {
  if (filePath.endsWith(".mp4")) return "video/mp4"
  if (filePath.endsWith(".mov")) return "video/quicktime"
  if (filePath.endsWith(".avi")) return "video/x-msvideo"
  if (filePath.endsWith(".webm")) return "video/webm"
  if (filePath.endsWith(".pdf")) return "application/pdf"
  if (filePath.endsWith(".txt")) return "text/plain"
  if (filePath.endsWith(".md")) return "text/markdown"
  return "application/octet-stream" // Tipo padrão
}

// Função para fazer requisições para a API do Gemini com conteúdo multimodal
export async function callGeminiMultimodalAPI(videoPath: string, pdfPath: string, prompt: string): Promise<string> {
  try {
    // Verificar se a API key está disponível
    if (!GEMINI_CONFIG.API_KEY) {
      console.error("API key do Gemini não encontrada. Verifique a variável de ambiente GEMINI_API_KEY.")
      throw new Error("API key do Gemini não configurada")
    }

    console.log("Preparando arquivos para envio ao Gemini...")

    // Converter arquivos para base64
    const videoBase64 = await fileToBase64(videoPath)
    const pdfBase64 = await fileToBase64(pdfPath)

    // Determinar tipos MIME
    const videoMimeType = getMimeType(videoPath)
    const pdfMimeType = getMimeType(pdfPath)

    console.log(`Tipo MIME do vídeo: ${videoMimeType}`)
    console.log(`Tipo MIME do PDF: ${pdfMimeType}`)

    // Endpoint para conteúdo do Gemini
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_CONFIG.API_KEY}`

    // Preparar o corpo da requisição com conteúdo multimodal
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: videoMimeType,
                data: videoBase64,
              },
            },
            {
              inline_data: {
                mime_type: pdfMimeType,
                data: pdfBase64,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    }

    console.log("Enviando arquivos para o Gemini...")

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro na resposta da API do Gemini:", errorText)
      throw new Error(`Erro na API do Gemini: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log("Resposta recebida da API do Gemini")

    // Extrair o texto da resposta
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    return text
  } catch (error) {
    console.error("Erro ao chamar a API do Gemini:", error)
    throw new Error(`Falha ao gerar conteúdo com o Gemini: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Função simplificada para chamadas de texto
export async function callGeminiAPI(prompt: string): Promise<string> {
  try {
    // Verificar se a API key está disponível
    if (!GEMINI_CONFIG.API_KEY) {
      console.error("API key do Gemini não encontrada. Verifique a variável de ambiente GEMINI_API_KEY.")
      throw new Error("API key do Gemini não configurada")
    }

    console.log("Chamando API do Gemini com prompt:", prompt.substring(0, 100) + "...")

    const response = await fetch(GEMINI_CONFIG.API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_CONFIG.API_KEY,
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro na resposta da API do Gemini:", errorText)
      throw new Error(`Erro na API do Gemini: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    console.log("Resposta recebida da API do Gemini")

    // Extrair o texto da resposta
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
    return text
  } catch (error) {
    console.error("Erro ao chamar a API do Gemini:", error)
    throw new Error(`Falha ao gerar conteúdo com o Gemini: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Adicionando esta função para processar URLs em vez de caminhos locais
export async function analyzeClassWithGemini(videoPath: string, pdfPath: string): Promise<string> {
  try {
    console.log("Analisando classe com o Gemini, caminhos:", { videoPath, pdfPath })
    
    // Verificar se os caminhos são URLs (para o Supabase)
    const isVideoUrl = videoPath.startsWith('http')
    const isPdfUrl = pdfPath.startsWith('http')
    
    let videoContent: string
    let pdfContent: string
    
    if (isVideoUrl && isPdfUrl) {
      console.log("Usando URLs para análise")
      
      // Função para buscar o conteúdo de uma URL
      const fetchContent = async (url: string): Promise<ArrayBuffer> => {
        console.log(`Buscando conteúdo de ${url}`)
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error(`Falha ao buscar ${url}: ${response.status} ${response.statusText}`)
        }
        return await response.arrayBuffer()
      }
      
      // Buscar o conteúdo do vídeo e do PDF
      try {
        const [videoBuffer, pdfBuffer] = await Promise.all([
          fetchContent(videoPath),
          fetchContent(pdfPath)
        ])
        
        // Criar os conteúdos base64
        videoContent = Buffer.from(videoBuffer).toString('base64')
        pdfContent = Buffer.from(pdfBuffer).toString('base64')
      } catch (fetchError) {
        console.error("Erro ao buscar conteúdo:", fetchError)
        throw fetchError
      }
    } else {
      console.log("Usando caminhos locais para análise")
      // Usar a função fileToBase64 existente para caminhos locais
      const { readFile } = await import('fs/promises')
      videoContent = (await readFile(videoPath)).toString('base64')
      pdfContent = (await readFile(pdfPath)).toString('base64')
    }
    
    const prompt = `Você é um analista educacional especializado em avaliação de aulas de inglês, com foco específico na metodologia INSIGHT para adultos.

# Relatório de Análise de Aula - INSIGHT

## Resumo da Aula
- Nível: [especifique o nível]
- Unidade/Lição: [especifique]
- Objetivos: [liste os objetivos principais]
- Duração total: [duração em minutos]

## Análise da Metodologia INSIGHT 📊

### Lead-in
- Como o professor introduziu o tema
- Eficácia da ativação de conhecimento prévio

### Vocabulary Focus
- Apresentação do vocabulário
- Prática inicial
- Checagem de compreensão

### Grammar Practice
- Apresentação das estruturas gramaticais
- Exercícios e atividades
- Correção de erros

### Integrated Skills
- Integração das habilidades (listening, speaking, reading, writing)
- Atividades comunicativas
- Interação entre os alunos

### Natural Communication
- Oportunidades para comunicação autêntica
- Qualidade das discussões
- Uso do inglês pelos alunos

### Target Language Review
- Revisão do conteúdo principal
- Eficácia da consolidação
- Follow-up assignments

## Pontos Fortes
- [liste pelo menos 3 aspectos positivos observados]

## Oportunidades de Melhoria
- [liste áreas específicas para desenvolvimento]

## Recomendações para o Professor
- [forneça orientações práticas e específicas]

Por favor, analise o conteúdo do vídeo e do material didático PDF fornecidos.`

    console.log("Enviando prompt para o Gemini")

    // Chamar o Gemini com o prompt e os conteúdos do vídeo e do PDF
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-vision-latest:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': process.env.GEMINI_API_KEY || ''
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: 'video/mp4',
                  data: videoContent
                }
              },
              {
                inline_data: {
                  mime_type: 'application/pdf',
                  data: pdfContent
                }
              }
            ]
          }
        ],
        generation_config: {
          temperature: 0.2,
          top_p: 0.95,
          top_k: 40,
          max_output_tokens: 8192
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Erro na resposta do Gemini:", errorText)
      throw new Error(`Erro na API do Gemini: ${response.status} ${errorText}`)
    }

    const data = await response.json()
    const result = data.candidates?.[0]?.content?.parts?.[0]?.text || "Não foi possível gerar a análise."
    console.log("Análise concluída com sucesso")
    return result
  } catch (error) {
    console.error("Erro ao analisar com o Gemini:", error)
    throw new Error(`Falha na análise: ${error instanceof Error ? error.message : String(error)}`)
  }
}
