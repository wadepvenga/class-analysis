const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

// Inicializa o cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    
    // Versão simplificada sem formidable
    // Como estamos em uma função serverless, vamos simular um upload bem-sucedido
    
    console.log('Iniciando upload simulado para o Supabase');
    
    // Registro da análise para demonstração
    const { data: analysisData, error: analysisError } = await supabase
      .from('analyses')
      .insert([
        {
          id,
          status: 'processing',
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