import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { GeminiService } from "@/lib/services/gemini-service";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    // Gerar ID único para esta análise
    const analysisId = uuidv4();

    // Criar diretório para esta análise
    const uploadsDir = path.join(process.cwd(), "uploads");
    const analysisDir = path.join(uploadsDir, analysisId);

    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }
    await mkdir(analysisDir, { recursive: true });

    // Obter o arquivo de vídeo e o ID da análise do PDF do form data
    const formData = await request.formData();
    const videoFile = formData.get("video") as File;
    const pdfAnalysisId = formData.get("pdfAnalysisId") as string;

    if (!videoFile) {
      return NextResponse.json({ error: "Video file is required" }, { status: 400 });
    }

    if (!pdfAnalysisId) {
      return NextResponse.json({ error: "PDF analysis ID is required" }, { status: 400 });
    }

    // Salvar o vídeo
    const videoPath = path.join(analysisDir, videoFile.name);
    const videoBuffer = Buffer.from(await videoFile.arrayBuffer());
    await writeFile(videoPath, videoBuffer);

    // Criar arquivo de resultados para indicar que o processamento começou
    const resultsPath = path.join(analysisDir, "results.json");
    await writeFile(
      resultsPath,
      JSON.stringify({
        status: "processing",
        timestamp: new Date().toISOString(),
      })
    );

    // Ler a análise do PDF
    const pdfResultsPath = path.join(uploadsDir, pdfAnalysisId, "results.json");
    const pdfResults = JSON.parse(await readFile(pdfResultsPath, 'utf-8'));
    const pdfAnalysis = pdfResults.analysis;

    // Analisar o vídeo com o Gemini, comparando com a análise do PDF
    const analysis = await GeminiService.analyzeVideoWithPDF(videoBuffer, pdfAnalysis);

    // Salvar os resultados
    await writeFile(
      resultsPath,
      JSON.stringify({
        status: "completed",
        analysis,
        timestamp: new Date().toISOString(),
      })
    );

    return NextResponse.json({ 
      analysisId,
      message: "Video uploaded and analyzed successfully" 
    });
  } catch (error) {
    console.error("Error analyzing video:", error);
    return NextResponse.json(
      { error: "Failed to analyze video" },
      { status: 500 }
    );
  }
} 