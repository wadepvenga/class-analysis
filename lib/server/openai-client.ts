import { OpenAI } from "openai"

// This function ensures the OpenAI client is only created once and only on the server
let openaiClient: OpenAI | null = null

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    // Check if we're in a Node.js environment
    if (typeof window === "undefined") {
      openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      })
    } else {
      throw new Error("OpenAI client cannot be initialized in browser environment")
    }
  }
  return openaiClient
}
