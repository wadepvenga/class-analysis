"use server"

import { createReadStream } from "fs"
import { OpenAI } from "openai"

// Initialize OpenAI client - this will only run on the server
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function transcribeVideo(videoPath: string): Promise<string> {
  try {
    // Create a readable stream from the video file
    const videoStream = createReadStream(videoPath)

    // Use OpenAI's Whisper API to transcribe the video
    const transcription = await openai.audio.transcriptions.create({
      file: videoStream as any,
      model: "whisper-1",
      language: "en", // Specify language if known
      response_format: "text",
    })

    return transcription
  } catch (error) {
    console.error("Error transcribing video:", error)
    throw new Error("Failed to transcribe video")
  }
}
