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
  console.log('EVENT:', {
    httpMethod: event.httpMethod,
    path: event.path,
    headers: event.headers,
    bodyLength: event.body ? event.body.length : 0
  });
  
  console.log('ENVIRONMENT:', {
    nodeEnv: process.env.NODE_ENV,
    netlifyEnv: process.env.NETLIFY,
    functionName: context.functionName,
    deployId: process.env.DEPLOY_ID
  });

  // Verificar se é uma requisição POST
  if (event.httpMethod !== 'POST') {
    console.error('INVALID_METHOD:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
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
    console.log('Content-Type:', event.headers['content-type']);
    console.log('RAW_BODY_LENGTH:', event.body ? event.body.length : 0);

    // Log dos headers para debug
    console.log('HEADERS:', event.headers);

    // Gerar ID simulado
    const id = 'simulated-id-' + requestId;
    console.log('GENERATED_ID:', id);

    // Preparar resposta
    const responseBody = {
      id,
      message: 'Upload simulado com sucesso (modo diagnóstico).',
      timestamp: new Date().toISOString(),
      requestId
    };

    console.log('RESPONSE_BODY:', responseBody);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      },
      body: JSON.stringify(responseBody)
    };

  } catch (error) {
    console.error('ERROR_PROCESSING:', {
      message: error.message,
      stack: error.stack,
      requestId,
      bodyLength: event.body ? event.body.length : 0
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
        type: error.name,
        timestamp: new Date().toISOString(),
        requestId
      })
    };
  }
}; 