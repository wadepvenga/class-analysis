import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
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

    // Obter o arquivo PDF do form data
    const formData = await request.formData();
    const pdfFile = formData.get("pdf") as File;

    if (!pdfFile) {
      return NextResponse.json({ error: "PDF file is required" }, { status: 400 });
    }

    // Salvar o PDF
    const pdfPath = path.join(analysisDir, pdfFile.name);
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());
    await writeFile(pdfPath, pdfBuffer);

    // Criar arquivo de resultados para indicar que o processamento começou
    const resultsPath = path.join(analysisDir, "results.json");
    await writeFile(
      resultsPath,
      JSON.stringify({
        status: "processing",
        timestamp: new Date().toISOString(),
      })
    );

    // Analisar o PDF com o Gemini
    const analysis = await GeminiService.analyzePDF(pdfBuffer);

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
      message: "PDF uploaded and analyzed successfully" 
    });
  } catch (error) {
    console.error("Error analyzing PDF:", error);
    return NextResponse.json(
      { error: "Failed to analyze PDF" },
      { status: 500 }
    );
  }
} 