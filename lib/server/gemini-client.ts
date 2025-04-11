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

export async function analyzeClassWithGemini(videoPath: string, pdfPath: string): Promise<string> {
  const prompt = `Você é um analista educacional especializado em avaliação de aulas de inglês, com foco específico na metodologia INSIGHT para adultos. 

INSTRUÇÕES IMPORTANTES:
1. NÃO comece o relatório com a transcrição.
2. A transcrição deve aparecer APENAS na seção "Transcrição da Aula".
3. A transcrição deve ser COMPLETA, do início ao fim da aula.
4. Ao analisar a aula, faça referência aos momentos específicos usando timestamps [MM:SS].

# Relatório de Análise de Aula - INSIGHT

## Resumo da Aula
- Nível: [especifique o nível]
- Unidade/Lição: [especifique]
- Objetivos: [liste os objetivos principais]
- Duração total: [duração em minutos]

## Transcrição da Aula 📝

[ATENÇÃO: Coloque aqui a transcrição COMPLETA da aula, seguindo este formato]

[00:00] Início da Aula
Professor: [transcreva a fala exata]
Ação: [descreva a ação]
Aluno(s): [transcreva as respostas, quando houver]

[MM:SS] Nome da Atividade
Professor: [transcreva a fala exata]
Ação: [descreva a ação]
Aluno(s): [transcreva as respostas]

[Continuar até o final da aula, incluindo TODAS as interações]

## Análise da Metodologia INSIGHT 📊

### Lead-in
- Como o professor introduziu o tema
- Eficácia da ativação de conhecimento prévio

### Vocabulary Focus
- Apresentação do vocabulário
- Técnicas de prática utilizadas
- Checagem de compreensão

### Grammar
- Apresentação da estrutura
- Prática controlada
- Prática livre

### Skills Work
- Reading activities
- Listening exercises
- Speaking opportunities
- Writing tasks

### Production/Practice
- Atividades comunicativas
- Trabalho em pares/grupos
- Correção de erros

### Wrap-up
- Revisão do conteúdo
- Avaliação da aprendizagem

## Análise Quantitativa 📈

### Tempo de Fala
- Professor: [X]%
- Alunos: [Y]%
- Interação entre alunos: [Z]%

### Uso da Língua-Alvo
- Inglês: [X]%
- Língua materna: [Y]%

## Avaliação Qualitativa ⭐

### Pontos Fortes
- [Liste pontos positivos específicos]
- [Cite exemplos concretos da aula]

### Áreas para Desenvolvimento
- [Identifique aspectos a melhorar]
- [Sugira alternativas específicas]

### Recomendações
1. [Recomendação específica 1]
2. [Recomendação específica 2]
3. [Recomendação específica 3]

LEMBRE-SE: 
- A transcrição deve estar APENAS na seção "Transcrição da Aula"
- Inclua TODAS as interações da aula na transcrição
- Use timestamps [MM:SS] para referenciar momentos específicos em suas análises
- Mantenha o foco na metodologia INSIGHT para adultos`

  return await callGeminiMultimodalAPI(videoPath, pdfPath, prompt)
}
