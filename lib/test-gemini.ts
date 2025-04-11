import "dotenv/config";
import { GEMINI_CONFIG } from "./config";

async function testGeminiAPI() {
  try {
    console.log("Usando chave API:", GEMINI_CONFIG.API_KEY);
    
    const response = await fetch(
      `${GEMINI_CONFIG.API_ENDPOINT}?key=${GEMINI_CONFIG.API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Olá, você pode me responder?"
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 1,
            topP: 1,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erro na API Gemini: ${response.status} - ${response.statusText}\nDetalhes: ${errorData}`);
    }

    const data = await response.json();
    console.log("Resposta da API Gemini:", data);
    return data;
  } catch (error) {
    console.error("Erro ao testar API Gemini:", error);
    throw error;
  }
}

// Executar o teste
testGeminiAPI()
  .then(() => console.log("Teste concluído com sucesso!"))
  .catch((error) => console.error("Teste falhou:", error)); 