import { GeminiService } from "./gemini-service";

export class VideoService {
  static async analyzeVideo(videoBuffer: Buffer, pdfText: string): Promise<string> {
    try {
      // Aqui vamos passar o vídeo diretamente para o Gemini analisar
      // junto com o texto do PDF para comparação
      const prompt = `
        Por favor, analise este vídeo de aula e compare com o guia do professor fornecido.
        
        Guia do Professor:
        ${pdfText}

        Por favor, forneça uma análise detalhada considerando:
        1. Aderência ao plano de aula
        2. Interação professor-aluno
        3. Clareza na explicação
        4. Uso do tempo
        5. Sugestões de melhoria
      `;

      const response = await GeminiService.analyzeVideoContent(videoBuffer, prompt);
      return response;
    } catch (error) {
      console.error('Erro ao analisar com Gemini:', error);
      throw new Error('Falha ao analisar o conteúdo');
    }
  }

  static async processVideo(videoBuffer: Buffer, filename: string): Promise<string> {
    // Simulate video processing and return a formatted string
    // In a real implementation, this would use a video processing library
    return `Transcription of video ${filename}:\n` +
           `This is a simulated transcription of the video content.\n` +
           `It would contain the actual text extracted from the video.`;
  }

  static async analyzeWithGemini(videoText: string, pdfText: string): Promise<string> {
    const prompt = `
      Please analyze this video transcription and compare it with the lesson plan:

      Video Transcription:
      ${videoText}

      Lesson Plan Analysis:
      ${pdfText}

      Please provide a detailed analysis considering:
      1. Adherence to the lesson plan
      2. Teacher-student interaction
      3. Clarity of explanation
      4. Time management
      5. Suggestions for improvement
    `;

    return await GeminiService.analyzeContent(prompt);
  }
} 