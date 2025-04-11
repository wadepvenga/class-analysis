export const GEMINI_CONFIG = {
  API_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent",
  API_KEY: process.env.GEMINI_API_KEY || "",
  MIME_TYPES: {
    VIDEO: ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"],
    PDF: ["application/pdf"],
    TEXT: ["text/plain", "text/markdown", "application/octet-stream"]
  }
}

// Log the API key (first 10 characters) for debugging
console.log("GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + "..." : "not found")

export const ANALYSIS_PROMPTS = {
  TRANSCRIPTION:
    "Você é um especialista em transcrição de aulas de inglês. Sua tarefa é criar uma transcrição detalhada e realista de uma aula de inglês com base nas informações fornecidas.",
  ANALYSIS:
    "Você é um especialista em análise educacional para escolas de idiomas. Sua tarefa é analisar detalhadamente a transcrição de uma aula de inglês e o guia do professor, fornecendo insights precisos e úteis.",
}
