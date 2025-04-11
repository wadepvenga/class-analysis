export const GEMINI_CONFIG = {
  API_ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
  API_KEY: process.env.GEMINI_API_KEY || "",
};

export const ANALYSIS_PROMPTS = {
  TRANSCRIPTION: "Por favor, transcreva o seguinte vídeo de aula, mantendo a estrutura de diálogo entre professor e alunos:",
  ANALYSIS: "Analise a seguinte transcrição de aula e o guia do professor, fornecendo insights sobre:",
}; 