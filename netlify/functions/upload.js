// Versão ultra simplificada para diagnóstico
exports.handler = async (event, context) => {
  console.log('Função de upload iniciada - VERSÃO DIAGNÓSTICO');
  
  // Logs detalhados do ambiente
  console.log('Ambiente:', {
    nodeEnv: process.env.NODE_ENV,
    netlifyEnv: process.env.NETLIFY,
    functionName: context.functionName,
    deployId: process.env.DEPLOY_ID
  });
  
  // Logs da requisição
  console.log('Detalhes da requisição:', {
    method: event.httpMethod,
    path: event.path,
    headers: event.headers,
    bodyLength: event.body ? event.body.length : 0
  });
  
  // Verificar se é uma requisição POST
  if (event.httpMethod !== 'POST') {
    console.log('Erro: Método não permitido:', event.httpMethod);
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: 'Método não permitido',
        method: event.httpMethod
      })
    };
  }
  
  try {
    console.log('Iniciando processamento do upload simulado');
    
    // Gerar ID simulado
    const id = 'simulated-id-' + Date.now();
    console.log('ID gerado:', id);
    
    // Responder com sucesso
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
      },
      body: JSON.stringify({ 
        id,
        message: 'Upload simulado com sucesso (modo diagnóstico).',
        timestamp: new Date().toISOString()
      })
    };
    
    console.log('Resposta preparada:', response);
    return response;
    
  } catch (error) {
    console.error('Erro detalhado:', {
      message: error.message,
      stack: error.stack,
      name: error.name
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
        timestamp: new Date().toISOString()
      })
    };
  }
}; 