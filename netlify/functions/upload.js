// Função de log aprimorada
const log = {
  info: (message, data = {}) => {
    console.log(JSON.stringify({
      level: 'info',
      timestamp: new Date().toISOString(),
      message,
      ...data
    }));
  },
  error: (message, error = null, data = {}) => {
    console.error(JSON.stringify({
      level: 'error',
      timestamp: new Date().toISOString(),
      message,
      errorDetails: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : null,
      ...data
    }));
  }
};

// Função para validar o corpo da requisição
const validateRequestBody = (body) => {
  try {
    const parsedBody = JSON.parse(body);
    log.info('Request body parsed successfully', { parsedBody });
    return { valid: true, data: parsedBody };
  } catch (error) {
    log.error('Failed to parse request body', error, { rawBody: body });
    return { valid: false, error };
  }
};

// Versão ultra simplificada para diagnóstico
exports.handler = async (event, context) => {
  // ID único para rastrear a requisição
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  log.info('Function invoked', {
    requestId,
    environment: {
      nodeEnv: process.env.NODE_ENV,
      netlifyEnv: process.env.NETLIFY,
      functionName: context.functionName,
      deployId: process.env.DEPLOY_ID
    }
  });

  log.info('Request details', {
    requestId,
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    bodyLength: event.body ? event.body.length : 0,
    queryStringParameters: event.queryStringParameters,
  });

  // Verificar se é uma requisição POST
  if (event.httpMethod !== 'POST') {
    log.error('Method not allowed', null, {
      requestId,
      method: event.httpMethod
    });
    
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
    log.info('Starting upload simulation', { requestId });

    // Validar o corpo da requisição
    const bodyValidation = validateRequestBody(event.body);
    if (!bodyValidation.valid) {
      throw new Error('Invalid request body');
    }

    // Gerar ID simulado
    const id = 'simulated-id-' + requestId;
    log.info('Generated ID', { requestId, id });

    // Preparar resposta
    const responseBody = {
      id,
      message: 'Upload simulado com sucesso (modo diagnóstico).',
      timestamp: new Date().toISOString(),
      requestId
    };

    log.info('Preparing response', { requestId, responseBody });

    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      },
      body: JSON.stringify(responseBody)
    };

    log.info('Response ready', { requestId, response });
    return response;

  } catch (error) {
    log.error('Processing failed', error, {
      requestId,
      body: event.body,
      headers: event.headers
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