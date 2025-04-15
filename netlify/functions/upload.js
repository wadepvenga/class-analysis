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
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
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
exports.handler = async (event, context) => {
  // ID único para rastrear a requisição
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  console.log('REQUEST_ID:', requestId);
  console.log('EVENT_METHOD:', event.httpMethod);
  console.log('EVENT_PATH:', event.path);
  
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
    console.error('INVALID_METHOD:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        error: 'Método não permitido',
        method: event.httpMethod,
        requestId
      })
    };
  }

  try {
    console.log('PROCESSING:', 'Starting upload simulation');
    
    // Log detalhado dos headers e body
    console.log('CONTENT_TYPE:', event.headers['content-type']);
    console.log('CONTENT_LENGTH:', event.headers['content-length']);
    console.log('ALL_HEADERS:', JSON.stringify(event.headers, null, 2));
    
    // Log do início do body para diagnóstico
    if (event.body) {
      console.log('BODY_START:', event.body.substring(0, 200) + '...');
      console.log('BODY_LENGTH:', event.body.length);
    } else {
      console.log('BODY: empty');
    }

    // Gerar ID simulado
    const id = 'simulated-id-' + requestId;
    console.log('GENERATED_ID:', id);

    // Preparar resposta
    const responseBody = {
      success: true,
      id,
      message: 'Upload simulado com sucesso (modo diagnóstico).',
      timestamp: new Date().toISOString(),
      requestId
    };

    console.log('RESPONSE_BODY:', responseBody);

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(responseBody)
    };

  } catch (error) {
    console.error('ERROR_DETAILS:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      requestId
    });

    return {
      statusCode: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        success: false,
        error: 'Falha no processamento do upload',
        details: error.message,
        type: error.name,
        timestamp: new Date().toISOString(),
        requestId
      })
    };
  }
}; 