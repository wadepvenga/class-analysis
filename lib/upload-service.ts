import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid'

// Inicialize o cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface UploadResult {
  id: string;
  videoUrl: string;
  pdfUrl: string;
  videoName: string;
  pdfName: string;
  timestamp: string;
}

export async function uploadFilesToSupabase(
  videoFile: File,
  pdfFile: File
): Promise<UploadResult> {
  try {
    console.log('Iniciando upload para o Supabase Storage');
    const id = uuidv4();
    const timestamp = new Date().toISOString();
    
    // Upload do vídeo
    const videoBuffer = await videoFile.arrayBuffer();
    const videoPath = `${id}/${videoFile.name}`;
    const { data: videoData, error: videoError } = await supabase.storage
      .from('class-analysis')
      .upload(videoPath, videoBuffer, {
        contentType: videoFile.type,
        upsert: true,
      });
    
    if (videoError) {
      console.error('Erro ao fazer upload do vídeo:', videoError);
      throw new Error(`Erro ao fazer upload do vídeo: ${videoError.message}`);
    }
    
    // Upload do PDF
    const pdfBuffer = await pdfFile.arrayBuffer();
    const pdfPath = `${id}/${pdfFile.name}`;
    const { data: pdfData, error: pdfError } = await supabase.storage
      .from('class-analysis')
      .upload(pdfPath, pdfBuffer, {
        contentType: pdfFile.type,
        upsert: true,
      });
    
    if (pdfError) {
      console.error('Erro ao fazer upload do PDF:', pdfError);
      throw new Error(`Erro ao fazer upload do PDF: ${pdfError.message}`);
    }
    
    // Obter URLs públicas
    const { data: videoUrl } = supabase.storage
      .from('class-analysis')
      .getPublicUrl(videoPath);
      
    const { data: pdfUrl } = supabase.storage
      .from('class-analysis')
      .getPublicUrl(pdfPath);
    
    return {
      id,
      videoUrl: videoUrl.publicUrl,
      pdfUrl: pdfUrl.publicUrl,
      videoName: videoFile.name,
      pdfName: pdfFile.name,
      timestamp
    };
  } catch (error) {
    console.error('Erro no serviço de upload:', error);
    throw error;
  }
} 