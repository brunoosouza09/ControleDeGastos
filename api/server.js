// Web API REST do Controle de Gastos (Checkpoint 3).
// Servidor HTTP em Node puro + banco SQLite nativo do Node (node:sqlite), sem dependências.
// Para iniciar: npm run api   (requer Node 22.5 ou superior)
//
// Endpoints (CRUD):
//   GET    /gastos         lista os gastos                         200
//   GET    /gastos/:id     busca um gasto                          200 | 404
//   POST   /gastos         cria um gasto { titulo, valor, categoria, data? }   201 | 400
//   PUT    /gastos/:id     altera um gasto { titulo, valor, categoria, data? } 200 | 400 | 404
//   DELETE /gastos/:id     exclui um gasto                         204 | 404
//
// Endpoints de demonstração (para mostrar no app cada situação tratada):
//   GET /cenario          mostra o cenário de simulação ativo
//   GET /cenario/:nome    troca o cenário ativo (normal | vazio | erro | lento)
//     normal -> funcionamento real
//     vazio  -> GET /gastos responde lista vazia
//     erro   -> todas as rotas de /gastos respondem 500 com { mensagem }
//     lento  -> todas as rotas de /gastos respondem após 3 s (ATRASO_LENTO_MS muda o tempo)
//   Também é possível forçar o cenário em uma única requisição: GET /gastos?cenario=erro
//
// Banco de dados: arquivo api/gastos.db (criado e populado com exemplos na primeira execução).
// Para recomeçar do zero, apague o arquivo ou rode: npm run api:reset

const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');

const PORTA = Number(process.env.PORT) || 3333;
const CENARIOS = ['normal', 'vazio', 'erro', 'lento'];
const ATRASO_CENARIO_LENTO_MS = Number(process.env.ATRASO_LENTO_MS) || 3000;
const CATEGORIAS = ['Alimentação', 'Transporte', 'Lazer', 'Moradia', 'Outros'];
const TAMANHO_MAXIMO_CORPO = 10 * 1024;
const CAMINHO_BANCO = process.env.DB_PATH || path.join(__dirname, 'gastos.db');

let cenarioAtivo = CENARIOS.includes(process.env.CENARIO) ? process.env.CENARIO : 'normal';

// ---------------------------------------------------------------- banco de dados

const banco = new DatabaseSync(CAMINHO_BANCO);
banco.exec(`
  CREATE TABLE IF NOT EXISTS gastos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo    TEXT    NOT NULL,
    valor     REAL    NOT NULL CHECK (valor > 0),
    categoria TEXT    NOT NULL,
    data      TEXT    NOT NULL
  )
`);

// Cria a data (ISO 8601) de um dia do mês atual ao meio-dia, para que o fuso
// horário não empurre o gasto para o dia ou mês vizinho
function dataDoMes(dia, deslocamentoDeMeses = 0) {
  const hoje = new Date();
  const diaSeguro = deslocamentoDeMeses === 0 ? Math.min(dia, hoje.getDate()) : dia;
  return new Date(hoje.getFullYear(), hoje.getMonth() + deslocamentoDeMeses, diaSeguro, 12).toISOString();
}

// Na primeira execução (tabela vazia), grava alguns gastos de exemplo
function popularSeVazio() {
  const { total } = banco.prepare('SELECT COUNT(*) AS total FROM gastos').get();
  if (total > 0) return;
  const inserir = banco.prepare('INSERT INTO gastos (titulo, valor, categoria, data) VALUES (?, ?, ?, ?)');
  [
    ['Supermercado', 187.5, 'Alimentação', dataDoMes(1)],
    ['Uber para o trabalho', 24.9, 'Transporte', dataDoMes(2)],
    ['Cinema com amigos', 60, 'Lazer', dataDoMes(3)],
    ['Aluguel', 1200, 'Moradia', dataDoMes(1)],
    ['Assinatura de streaming', 39.9, 'Outros', dataDoMes(new Date().getDate())],
    ['Almoço de domingo', 82, 'Alimentação', dataDoMes(15, -1)],
    ['Gasolina', 210, 'Transporte', dataDoMes(20, -1)],
  ].forEach((linha) => inserir.run(...linha));
  console.log('Banco criado com gastos de exemplo.');
}

if (process.argv.includes('--reset')) {
  banco.exec('DELETE FROM gastos; DELETE FROM sqlite_sequence WHERE name = \'gastos\';');
  console.log('Banco apagado.');
}
popularSeVazio();

// O id sai do banco como número; a API sempre o devolve como texto
function paraJson(linha) {
  return { id: String(linha.id), titulo: linha.titulo, valor: linha.valor, categoria: linha.categoria, data: linha.data };
}

const consultas = {
  listar: banco.prepare('SELECT * FROM gastos ORDER BY data DESC, id DESC'),
  buscar: banco.prepare('SELECT * FROM gastos WHERE id = ?'),
  inserir: banco.prepare('INSERT INTO gastos (titulo, valor, categoria, data) VALUES (?, ?, ?, ?)'),
  atualizar: banco.prepare('UPDATE gastos SET titulo = ?, valor = ?, categoria = ?, data = ? WHERE id = ?'),
  excluir: banco.prepare('DELETE FROM gastos WHERE id = ?'),
};

// ---------------------------------------------------------------- validação

/** Valida o corpo de POST/PUT. Devolve { erros } ou { gasto } já normalizado */
function validarGasto(corpo, dataPadrao) {
  const erros = [];
  if (!corpo || typeof corpo !== 'object' || Array.isArray(corpo)) {
    return { erros: ['O corpo da requisição deve ser um objeto JSON.'] };
  }

  const titulo = typeof corpo.titulo === 'string' ? corpo.titulo.trim() : '';
  if (!titulo) erros.push('O título é obrigatório.');
  else if (titulo.length > 80) erros.push('O título deve ter no máximo 80 caracteres.');

  const valor = typeof corpo.valor === 'number' ? corpo.valor : NaN;
  if (!Number.isFinite(valor) || valor <= 0) erros.push('O valor deve ser um número maior que zero.');
  else if (valor > 1_000_000) erros.push('O valor deve ser menor que R$ 1.000.000,00.');

  if (!CATEGORIAS.includes(corpo.categoria)) {
    erros.push(`A categoria deve ser uma destas: ${CATEGORIAS.join(', ')}.`);
  }

  let data = dataPadrao;
  if (corpo.data !== undefined) {
    const convertida = new Date(corpo.data);
    if (typeof corpo.data !== 'string' || Number.isNaN(convertida.getTime())) {
      erros.push('A data deve estar no formato ISO 8601.');
    } else {
      data = convertida.toISOString();
    }
  }

  if (erros.length > 0) return { erros };
  return { gasto: { titulo, valor: Math.round(valor * 100) / 100, categoria: corpo.categoria, data } };
}

// ---------------------------------------------------------------- HTTP

// CORS: só libera o navegador quando a página vem do Expo Web (porta 8081, ou a definida em
// CORS_PORTA). Assim, outro site aberto no navegador não consegue alterar os gastos.
// O app no celular (Expo Go) não envia Origin e não é afetado.
const PORTA_EXPO_WEB = process.env.CORS_PORTA || '8081';

function cabecalhosCors(req) {
  const origem = req.headers.origin;
  let permitida = false;
  try {
    permitida = Boolean(origem) && new URL(origem).port === PORTA_EXPO_WEB;
  } catch {
    permitida = false;
  }
  if (!permitida) return {};
  return {
    'Access-Control-Allow-Origin': origem,
    Vary: 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
  };
}

function responderJson(res, status, corpo) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...cabecalhosCors(res.req) });
  res.end(JSON.stringify(corpo));
}

function responderSemConteudo(res) {
  res.writeHead(204, cabecalhosCors(res.req));
  res.end();
}

/** Lê o corpo JSON da requisição (com limite de tamanho) */
function lerCorpoJson(req) {
  return new Promise((resolver, rejeitar) => {
    // Exigir JSON impede que um formulário de outro site envie dados sem a verificação de CORS
    if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
      rejeitar({ status: 415, mensagem: 'Envie os dados em JSON (Content-Type: application/json).' });
      return;
    }
    let texto = '';
    req.setEncoding('utf8');
    req.on('data', (parte) => {
      texto += parte;
      if (texto.length > TAMANHO_MAXIMO_CORPO) {
        rejeitar({ status: 413, mensagem: 'O corpo da requisição é grande demais.' });
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolver(texto ? JSON.parse(texto) : null);
      } catch {
        rejeitar({ status: 400, mensagem: 'O corpo da requisição não é um JSON válido.' });
      }
    });
    req.on('error', () => rejeitar({ status: 400, mensagem: 'Falha ao ler a requisição.' }));
  });
}

/** Converte o :id da URL; ids não numéricos simplesmente não existem (404) */
function idDaUrl(texto) {
  return /^\d+$/.test(texto) ? Number(texto) : null;
}

const naoEncontrado = (res) => responderJson(res, 404, { mensagem: 'Gasto não encontrado.' });

async function tratarGastos(req, res, id, cenario) {
  if (cenario === 'erro') {
    responderJson(res, 500, { mensagem: 'Erro interno no servidor. Tente novamente em instantes.' });
    return;
  }
  if (cenario === 'lento') {
    await new Promise((r) => setTimeout(r, ATRASO_CENARIO_LENTO_MS));
  }

  // Coleção: /gastos
  if (id === undefined) {
    if (req.method === 'GET') {
      responderJson(res, 200, cenario === 'vazio' ? [] : consultas.listar.all().map(paraJson));
      return;
    }
    if (req.method === 'POST') {
      const { erros, gasto } = validarGasto(await lerCorpoJson(req), new Date().toISOString());
      if (erros) {
        responderJson(res, 400, { mensagem: erros.join(' '), erros });
        return;
      }
      const { lastInsertRowid } = consultas.inserir.run(gasto.titulo, gasto.valor, gasto.categoria, gasto.data);
      responderJson(res, 201, paraJson(consultas.buscar.get(lastInsertRowid)));
      return;
    }
    responderJson(res, 405, { mensagem: 'Método não permitido.' });
    return;
  }

  // Item: /gastos/:id
  const idNumerico = idDaUrl(id);
  const existente = idNumerico === null ? undefined : consultas.buscar.get(idNumerico);

  if (req.method === 'GET') {
    if (!existente) return naoEncontrado(res);
    responderJson(res, 200, paraJson(existente));
    return;
  }
  if (req.method === 'PUT') {
    if (!existente) return naoEncontrado(res);
    const { erros, gasto } = validarGasto(await lerCorpoJson(req), existente.data);
    if (erros) {
      responderJson(res, 400, { mensagem: erros.join(' '), erros });
      return;
    }
    consultas.atualizar.run(gasto.titulo, gasto.valor, gasto.categoria, gasto.data, idNumerico);
    responderJson(res, 200, paraJson(consultas.buscar.get(idNumerico)));
    return;
  }
  if (req.method === 'DELETE') {
    if (!existente) return naoEncontrado(res);
    consultas.excluir.run(idNumerico);
    responderSemConteudo(res);
    return;
  }
  responderJson(res, 405, { mensagem: 'Método não permitido.' });
}

const servidor = http.createServer(async (req, res) => {
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
    res.writeHead(204, cabecalhosCors(req));
    res.end();
    return;
  }

  try {
    if (partes[0] === 'gastos' && partes.length <= 2) {
      const pedido = url.searchParams.get('cenario');
      await tratarGastos(req, res, partes[1], CENARIOS.includes(pedido) ? pedido : cenarioAtivo);
      return;
    }

    if (partes[0] === 'cenario' && req.method === 'GET') {
      if (partes.length === 1) {
        responderJson(res, 200, { cenario: cenarioAtivo, disponiveis: CENARIOS });
        return;
      }
      if (partes.length === 2) {
        if (!CENARIOS.includes(partes[1])) {
          responderJson(res, 400, { mensagem: `Cenário inválido. Use: ${CENARIOS.join(', ')}.` });
          return;
        }
        cenarioAtivo = partes[1];
        console.log(`Cenário ativo: ${cenarioAtivo}`);
        responderJson(res, 200, { cenario: cenarioAtivo });
        return;
      }
    }

    responderJson(res, 404, { mensagem: 'Recurso não encontrado.' });
  } catch (erro) {
    if (res.headersSent) return;
    if (erro && erro.status) {
      responderJson(res, erro.status, { mensagem: erro.mensagem });
      return;
    }
    console.error(erro);
    responderJson(res, 500, { mensagem: 'Erro interno no servidor.' });
  }
});

servidor.listen(PORTA, () => {
  console.log(`API do Controle de Gastos rodando na porta ${PORTA} (cenário: ${cenarioAtivo})`);
  console.log(`Banco de dados: ${CAMINHO_BANCO}`);
  const enderecos = Object.values(os.networkInterfaces())
    .flat()
    .filter((interfaceDeRede) => interfaceDeRede && interfaceDeRede.family === 'IPv4' && !interfaceDeRede.internal)
    .map((interfaceDeRede) => `http://${interfaceDeRede.address}:${PORTA}`);
  console.log(`Use no app (EXPO_PUBLIC_API_URL): ${enderecos.join('  ou  ') || 'nenhum IP de rede encontrado'}`);
});
