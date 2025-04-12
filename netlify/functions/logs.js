const { createClient } = require('@supabase/supabase-js');

// Inicializa o cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

exports.handler = async (event, context) => {
  // Verificar autenticação básica para segurança
  const authHeader = event.headers.authorization || '';
  const expectedToken = process.env.LOGS_ACCESS_TOKEN;
  
  if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Não autorizado' })
    };
  }
  
  try {
    // Obter os parâmetros de consulta
    const queryParams = event.queryStringParameters || {};
    const limit = parseInt(queryParams.limit) || 10;
    const offset = parseInt(queryParams.offset) || 0;
    
    console.log('Buscando logs de erro');
    
    // Buscar logs de erro do Supabase
    const { data: logs, error, count } = await supabase
      .from('error_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('Erro ao buscar logs:', error);
      throw error;
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        logs,
        total: count,
        page: Math.floor(offset / limit) + 1,
        limit
      })
    };
  } catch (error) {
    console.error('Erro completo:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: 'Falha ao buscar logs',
        details: error.message
      })
    };
  }
}; 