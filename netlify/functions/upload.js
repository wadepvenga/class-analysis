const formidable = require('formidable');

// Função de log adaptada para o Netlify
const log = {
  info: (message, data = {}) => {
    // Netlify exibe melhor logs simples sem stringify
    console.log('INFO:', message);
    console.log('DATA:', data);
  },
  error: (message, error = null, data = {}) => {
    console.error('ERROR:', message);
    if (error) {
      console.error('ERROR_DETAILS:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    }
    if (Object.keys(data).length > 0) {
      console.error('ERROR_DATA:', data);
    }
  }
};

// Headers padrão para CORS
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
};

// Função para validar o corpo da requisição
const validateRequestBody = (body) => {
  if (!body) {
    return { valid: false, error: new Error('Body is empty') };
  }

  try {
    // Log do body antes do parse
    console.log('RAW_BODY:', body);
    
    const parsedBody = JSON.parse(body);
    log.info('Body parsed successfully', parsedBody);
    return { valid: true, data: parsedBody };
  } catch (error) {
    log.error('Failed to parse body', error, { bodyReceived: body });
    return { valid: false, error };
  }
};

// Versão ultra simplificada para diagnóstico
exports.handler = async function(event, context) {
  console.log('UPLOAD_FUNCTION_CALLED');
  console.log('Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));

  // Handling OPTIONS request (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: ''
    };
  }

  // Verificar se é uma requisição POST
  if (event.httpMethod !== 'POST') {
    console.error('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({
        error: 'Método não permitido',
        method: event.httpMethod
      })
    };
  }

  try {
    console.log('Content-Type:', event.headers['content-type']);
    console.log('Content-Length:', event.headers['content-length']);

    // Por enquanto, apenas simular sucesso
    const id = 'simulated-' + Date.now();
    
    console.log('Generated ID:', id);

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        id,
        message: 'Upload simulado com sucesso',
        timestamp: new Date().toISOString()
      })
    };

  } catch (error) {
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        success: false,
        error: 'Falha no processamento do upload',
        details: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}; 