// Versão ultra simplificada para diagnóstico
exports.handler = async (event, context) => {
  console.log('Função de upload iniciada - VERSÃO DIAGNÓSTICO');
  
  // Logs iniciais para diagnóstico
  console.log('Método HTTP:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers));
  
  // Verificar se é uma requisição POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }
  
  try {
    console.log('Gerando ID simulado');
    
    // Gerar ID simulado
    const id = 'simulated-id-' + Date.now();
    
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
        message: 'Upload simulado com sucesso (modo diagnóstico).'
      })
    };
  } catch (error) {
    console.error('Erro:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Falha no processamento do upload',
        details: error.message
      })
    };
  }
}; 