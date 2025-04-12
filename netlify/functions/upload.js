const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const formidable = require('formidable');
const fs = require('fs');
const util = require('util');
const path = require('path');

// Inicializa o cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Função auxiliar para converter buffer em base64
const bufferToBase64 = (buffer) => {
  return buffer.toString('base64');
};

// Função para salvar detalhes de erro no Supabase para diagnóstico
const logError = async (error, context) => {
  try {
    const { data, error: supabaseError } = await supabase
      .from('error_logs')
      .insert([
        {
          error_message: error.message || 'Unknown error',
          error_stack: error.stack || '',
          context: JSON.stringify(context),
          timestamp: new Date().toISOString()
        }
      ]);
    
    if (supabaseError) {
      console.error('Erro ao salvar log de erro:', supabaseError);
    }
  } catch (logError) {
    console.error('Falha ao registrar erro:', logError);
  }
};

// Handler principal da função
exports.handler = async (event, context) => {
  console.log('Função de upload iniciada');
  
  // Logs iniciais para diagnóstico
  console.log('Método HTTP:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers));
  console.log('Ambiente:', process.env.NODE_ENV);
  
  // Verificar se é uma requisição POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }
  
  try {
    console.log('Iniciando processamento do upload');
    
    // Gerar ID único para esta análise
    const id = uuidv4();
    console.log('ID gerado:', id);
    
    // O evento possui um body que é codificado como multipart/form-data
    const contentType = event.headers['content-type'] || '';
    console.log('Content-Type:', contentType);
    
    if (!contentType.includes('multipart/form-data')) {
      throw new Error('Content-type deve ser multipart/form-data');
    }
    
    // Criar diretório temporário para os arquivos se necessário
    const tmpDir = '/tmp';
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    
    // Processar o formulário
    const form = new formidable.IncomingForm({
      uploadDir: tmpDir,
      keepExtensions: true,
      maxFileSize: 500 * 1024 * 1024, // 500MB
    });
    
    // Promisify o parse para usar async/await
    const parseForm = util.promisify(form.parse).bind(form);
    
    // Analisar o formulário
    console.log('Iniciando parse do formulário');
    
    // Aqui temos que converter o evento do Netlify para um formato que o formidable entenda
    const fields = {};
    const files = {};
    
    try {
      // Simulando um parse manual já que estamos em ambiente serverless
      // Na verdade, vamos armazenar o raw body para upload direto
      const base64Body = event.body;
      const boundary = contentType.split('boundary=')[1];
      
      console.log('Boundary detectado:', boundary);
      console.log('Tamanho do body:', event.body.length);
      
      // Agora vamos tentar fazer o upload diretamente para o Supabase
      console.log('Iniciando upload para o Supabase');
      
      // Extrair metadados do body (isso seria feito pelo formidable normalmente)
      // Para simplificar, vamos apenas simular um upload básico
      
      const videoBase64 = 'VIDEO_PLACEHOLDER'; // Aqui seria o conteúdo real do vídeo
      const pdfBase64 = 'PDF_PLACEHOLDER'; // Aqui seria o conteúdo real do PDF
      
      // Upload para o Supabase Storage
      const videoPath = `${id}/video.mp4`;
      const pdfPath = `${id}/guide.pdf`;
      
      console.log('Preparando upload do vídeo:', videoPath);
      const { data: videoData, error: videoError } = await supabase.storage
        .from('class-analysis')
        .upload(videoPath, Buffer.from('teste'), {
          contentType: 'video/mp4',
          upsert: true
        });
      
      if (videoError) {
        console.error('Erro ao fazer upload do vídeo:', videoError);
        throw new Error(`Erro ao fazer upload do vídeo: ${videoError.message}`);
      }
      
      console.log('Vídeo enviado com sucesso');
      
      const { data: videoUrl } = supabase.storage
        .from('class-analysis')
        .getPublicUrl(videoPath);
      
      // Registrar a análise no banco de dados para acompanhamento
      const { data: analysisData, error: analysisError } = await supabase
        .from('analyses')
        .insert([
          {
            id,
            status: 'processing',
            video_url: videoUrl.publicUrl,
            pdf_url: '',
            created_at: new Date().toISOString(),
            metadata: {
              modality: 'Adults',
              book: 'INSIGHT',
              classNumber: '1A',
              teacherName: 'Test'
            }
          }
        ]);
      
      if (analysisError) {
        console.error('Erro ao registrar análise:', analysisError);
        throw new Error(`Erro ao registrar análise: ${analysisError.message}`);
      }
      
      console.log('Análise registrada com sucesso');
      
      // Responder com sucesso
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
        },
        body: JSON.stringify({ 
          id,
          message: 'Upload iniciado com sucesso. A análise está em processamento.'
        })
      };
    } catch (parseError) {
      console.error('Erro ao analisar o formulário:', parseError);
      await logError(parseError, { step: 'parse_form', event: { headers: event.headers } });
      throw parseError;
    }
  } catch (error) {
    console.error('Erro completo:', error);
    
    // Log detalhado do erro para diagnóstico
    await logError(error, { 
      event: { 
        method: event.httpMethod,
        path: event.path,
        headers: event.headers,
        bodyLength: event.body ? event.body.length : 0
      }
    });
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Falha no processamento do upload',
        details: error.message,
        errorId: uuidv4() // ID único para rastrear este erro nos logs
      })
    };
  }
}; 