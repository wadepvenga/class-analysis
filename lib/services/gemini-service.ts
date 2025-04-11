import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiService {
  private static model: any;

  private static initialize() {
    if (!GeminiService.model) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not configured');
      }
      const genAI = new GoogleGenerativeAI(apiKey);
      GeminiService.model = genAI.getGenerativeModel({ 
        model: "gemini-2-flash-thinking-experimental-01-21",
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_NONE",
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_NONE",
          },
        ],
      });
    }
  }

  static async analyzeContent(prompt: string): Promise<string> {
    try {
      GeminiService.initialize();
      const result = await GeminiService.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error generating content with Gemini:', error);
      throw new Error('Failed to generate content');
    }
  }

  static async analyzeVideoContent(videoBuffer: Buffer, prompt: string): Promise<string> {
    try {
      GeminiService.initialize();

      const videoData = {
        inlineData: {
          data: videoBuffer.toString('base64'),
          mimeType: "video/mp4"
        }
      };

      const result = await GeminiService.model.generateContent([prompt, videoData]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Error analyzing video with Gemini:', error);
      throw new Error('Failed to analyze video content');
    }
  }

  static async analyzePDF(pdfBuffer: Buffer): Promise<string> {
    try {
      GeminiService.initialize();

      const pdfData = {
        inlineData: {
          data: pdfBuffer.toString('base64'),
          mimeType: "application/pdf"
        }
      };

      const prompt = `
        Por favor, analise este plano de aula ou guia do professor.
        
        Extraia e organize as informações principais como:
        1. Objetivos da aula
        2. Conteúdo programático
        3. Metodologia
        4. Recursos necessários
        5. Avaliação
        6. Cronograma/Tempo estimado
      `;

      const result = await GeminiService.model.generateContent([prompt, pdfData]);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error analyzing PDF with Gemini:', error);
      if (error.message?.includes('API key not valid')) {
        throw new Error('API key inválida. Por favor, configure uma chave válida da API do Gemini.');
      }
      throw new Error('Falha ao analisar o PDF. Por favor, tente novamente.');
    }
  }

  static async analyzeVideoWithPDF(videoBuffer: Buffer, pdfAnalysis: string): Promise<string> {
    try {
      GeminiService.initialize();

      const videoData = {
        inlineData: {
          data: videoBuffer.toString('base64'),
          mimeType: "video/mp4"
        }
      };

      const prompt = `
        Por favor, analise este vídeo de aula e compare com o plano de aula fornecido.
        
        Plano de Aula Analisado:
        ${pdfAnalysis}

        Por favor, forneça uma análise detalhada considerando:
        1. Aderência ao plano de aula
        2. Interação professor-aluno
        3. Clareza na explicação
        4. Uso do tempo
        5. Sugestões de melhoria
      `;

      const result = await GeminiService.model.generateContent([prompt, videoData]);
      const response = await result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error analyzing video with Gemini:', error);
      if (error.message?.includes('API key not valid')) {
        throw new Error('API key inválida. Por favor, configure uma chave válida da API do Gemini.');
      }
      throw new Error('Falha ao analisar o vídeo. Por favor, tente novamente.');
    }
  }
} 