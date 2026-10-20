// Web API REST do Controle de Gastos (Checkpoint 2).
// Servidor HTTP em Node puro, sem dependências. Para iniciar: npm run api
//
// Endpoints:
//   GET /gastos           lista os gastos (JSON)
//   GET /cenario          mostra o cenário de simulação ativo
//   GET /cenario/:nome    troca o cenário ativo (normal | vazio | erro | lento)
//
// Os cenários existem para demonstrar no app cada situação tratada:
//   normal -> 200 com dados
//   vazio  -> 200 com lista vazia
//   erro   -> 500 com { mensagem }
//   lento  -> 200 com dados após 3 segundos (mostra o "carregando"); ATRASO_LENTO_MS muda o tempo
// Também é possível forçar o cenário em uma única requisição: GET /gastos?cenario=erro

const http = require('node:http');
const os = require('node:os');

const PORTA = Number(process.env.PORT) || 3333;
const CENARIOS = ['normal', 'vazio', 'erro', 'lento'];
const ATRASO_CENARIO_LENTO_MS = Number(process.env.ATRASO_LENTO_MS) || 3000;

let cenarioAtivo = CENARIOS.includes(process.env.CENARIO) ? process.env.CENARIO : 'normal';

// Cria a data (ISO 8601) de um dia do mês atual ao meio-dia, para que o fuso
// horário não empurre o gasto para o dia ou mês vizinho
function dataDoMes(dia, deslocamentoDeMeses = 0) {
  const hoje = new Date();
  const diaSeguro = deslocamentoDeMeses === 0 ? Math.min(dia, hoje.getDate()) : dia;
  return new Date(hoje.getFullYear(), hoje.getMonth() + deslocamentoDeMeses, diaSeguro, 12).toISOString();
}

function listarGastos() {
  return [
    { id: '1', titulo: 'Supermercado', valor: 187.5, categoria: 'Alimentação', data: dataDoMes(3) },
    { id: '2', titulo: 'Uber para o trabalho', valor: 24.9, categoria: 'Transporte', data: dataDoMes(5) },
    { id: '3', titulo: 'Cinema com amigos', valor: 60, categoria: 'Lazer', data: dataDoMes(9) },
    { id: '4', titulo: 'Aluguel', valor: 1200, categoria: 'Moradia', data: dataDoMes(10) },
    { id: '5', titulo: 'Assinatura de streaming', valor: 39.9, categoria: 'Outros', data: dataDoMes(new Date().getDate()) },
    { id: '6', titulo: 'Almoço de domingo', valor: 82, categoria: 'Alimentação', data: dataDoMes(15, -1) },
    { id: '7', titulo: 'Gasolina', valor: 210, categoria: 'Transporte', data: dataDoMes(20, -1) },
  ];
}

function responderJson(res, status, corpo) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    // Libera o acesso quando o app roda no navegador (expo start --web)
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(corpo));
}

function tratarGastos(res, cenario) {
  if (cenario === 'erro') {
    responderJson(res, 500, { mensagem: 'Erro interno ao consultar os gastos.' });
    return;
  }
  if (cenario === 'vazio') {
    responderJson(res, 200, []);
    return;
  }
  if (cenario === 'lento') {
    setTimeout(() => responderJson(res, 200, listarGastos()), ATRASO_CENARIO_LENTO_MS);
    return;
  }
  responderJson(res, 200, listarGastos());
}

const servidor = http.createServer((req, res) => {
  // Só o caminho e a query são usados, então a base é fixa: o cabeçalho Host e o alvo da
  // requisição vêm do cliente, e uma requisição malformada não pode derrubar o processo
  let url;
  try {
    url = new URL(req.url, 'http://localhost');
  } catch {
    responderJson(res, 400, { mensagem: 'Requisição inválida.' });
    return;
  }
  const partes = url.pathname.split('/').filter(Boolean);
  console.log(`${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
    });
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    responderJson(res, 405, { mensagem: 'Método não permitido.' });
    return;
  }

  if (partes[0] === 'gastos' && partes.length === 1) {
    const pedido = url.searchParams.get('cenario');
    tratarGastos(res, CENARIOS.includes(pedido) ? pedido : cenarioAtivo);
    return;
  }

  if (partes[0] === 'cenario' && partes.length === 1) {
    responderJson(res, 200, { cenario: cenarioAtivo, disponiveis: CENARIOS });
    return;
  }

  if (partes[0] === 'cenario' && partes.length === 2) {
    if (!CENARIOS.includes(partes[1])) {
      responderJson(res, 400, { mensagem: `Cenário inválido. Use: ${CENARIOS.join(', ')}.` });
      return;
    }
    cenarioAtivo = partes[1];
    console.log(`Cenário ativo: ${cenarioAtivo}`);
    responderJson(res, 200, { cenario: cenarioAtivo });
    return;
  }

  responderJson(res, 404, { mensagem: 'Recurso não encontrado.' });
});

servidor.listen(PORTA, () => {
  console.log(`API do Controle de Gastos rodando na porta ${PORTA} (cenário: ${cenarioAtivo})`);
  const enderecos = Object.values(os.networkInterfaces())
    .flat()
    .filter((interfaceDeRede) => interfaceDeRede && interfaceDeRede.family === 'IPv4' && !interfaceDeRede.internal)
    .map((interfaceDeRede) => `http://${interfaceDeRede.address}:${PORTA}`);
  console.log(`Use no app (EXPO_PUBLIC_API_URL): ${enderecos.join('  ou  ') || 'nenhum IP de rede encontrado'}`);
});
