"use server"

import { OpenAI } from "openai"

// Initialize OpenAI client - this will only run on the server
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface AnalysisResults {
  contentCoverage: {
    score: number
    details: string[]
    missingTopics: string[]
  }
  studentInteraction: {
    score: number
    details: string[]
    interactionCount: number
  }
  languageLevel: {
    estimatedLevel: string
    details: string[]
    vocabulary: {
      advanced: string[]
      intermediate: string[]
      basic: string[]
    }
  }
  pacing: {
    score: number
    details: string[]
  }
  recommendations: string[]
}

export async function analyzeClassContent(transcript: string, guideText: string): Promise<AnalysisResults> {
  try {
    // Use OpenAI to analyze the content
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert educational analyst. You will analyze a class transcript against a teaching guide and provide detailed feedback.
          
          Your analysis should include:
          1. Content coverage (how well the class covered the material in the guide)
          2. Student interaction quality and quantity
          3. Language level assessment
          4. Pacing analysis
          5. Specific recommendations for improvement
          
          Provide your analysis in a structured JSON format.`,
        },
        {
          role: "user",
          content: `Class Transcript: ${transcript.substring(0, 8000)}
          
          Teaching Guide: ${guideText.substring(0, 8000)}
          
          Please analyze this class and provide detailed feedback in JSON format.`,
        },
      ],
      response_format: { type: "json_object" },
    })

    // Parse the response
    const analysisText = response.choices[0].message.content || "{}"
    const analysis = JSON.parse(analysisText) as AnalysisResults

    return analysis
  } catch (error) {
    console.error("Error analyzing content:", error)
    throw new Error("Failed to analyze content")
  }
}
