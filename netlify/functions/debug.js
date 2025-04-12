// Função simples para debug
exports.handler = async (event, context) => {
  // Capturar informações sobre o ambiente
  const environmentInfo = {
    netlifyEnv: process.env.NETLIFY || 'não definido',
    nodeEnv: process.env.NODE_ENV || 'não definido',
    nodeVersion: process.version,
    functionName: context.functionName,
    deployID: process.env.DEPLOY_ID || 'não definido',
    siteURL: process.env.URL || 'não definido',
    headers: event.headers,
    path: event.path,
    httpMethod: event.httpMethod,
    eventType: event.httpMethod === 'OPTIONS' ? 'CORS preflight' : 'Normal request'
  };

  // Verificar se há erros nas funções de acesso às variáveis de ambiente
  const environmentAccessTest = {};
  try {
    environmentAccessTest.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ? 'definido' : 'não definido';
  } catch (error) {
    environmentAccessTest.supabaseUrl = `erro: ${error.message}`;
  }

  // Testar a função require
  const requireTest = {};
  try {
    requireTest.fsTest = 'Node.js fs ' + (require('fs') ? 'disponível' : 'não disponível');
  } catch (error) {
    requireTest.fsTest = `erro: ${error.message}`;
  }

  try {
    requireTest.pathTest = 'Node.js path ' + (require('path') ? 'disponível' : 'não disponível');
  } catch (error) {
    requireTest.pathTest = `erro: ${error.message}`;
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Função de debug do Netlify',
      timestamp: new Date().toISOString(),
      environment: environmentInfo,
      environmentAccess: environmentAccessTest,
      requireTests: requireTest
    }, null, 2)
  };
}; 