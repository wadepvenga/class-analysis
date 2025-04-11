export class PDFService {
  static async extractText(pdfBuffer: Buffer): Promise<string> {
    try {
      // O Gemini 2.0 Flash Thinking Experimental pode ler PDFs diretamente
      // então não precisamos mais extrair o texto aqui
      return "PDF processado com sucesso";
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF');
    }
  }
} 