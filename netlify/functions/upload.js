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
exports.handler = async function(event, context) {
  // Log básico
  console.log('UPLOAD_FUNCTION_CALLED');
  console.log('Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers));

  // Resposta simples
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: "Função de upload chamada com sucesso",
      timestamp: new Date().toISOString()
    })
  };
}; 