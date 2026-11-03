// Web API REST do Controle de Gastos (Checkpoint 3).
// Servidor HTTP em Node puro + banco de dados PostgreSQL (driver "pg").
// Para iniciar: docker compose up -d   (sobe o PostgreSQL)   e depois   npm run api
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
// Banco de dados: PostgreSQL (DATABASE_URL; padrão: o container do docker-compose.yml).
// A tabela "gastos" é criada e populada com exemplos na primeira execução.
// Para recomeçar do zero, rode: npm run api:reset

const http = require('node:http');
const os = require('node:os');
const { Pool } = require('pg');

const PORTA = Number(process.env.PORT) || 3333;
const CENARIOS = ['normal', 'vazio', 'erro', 'lento'];
const ATRASO_CENARIO_LENTO_MS = Number(process.env.ATRASO_LENTO_MS) || 3000;
const CATEGORIAS = ['Alimentação', 'Transporte', 'Lazer', 'Moradia', 'Outros'];
const TAMANHO_MAXIMO_CORPO = 10 * 1024;
const URL_BANCO = process.env.DATABASE_URL || 'postgresql://gastos:gastos@localhost:5433/gastos';

let cenarioAtivo = CENARIOS.includes(process.env.CENARIO) ? process.env.CENARIO : 'normal';

// ---------------------------------------------------------------- banco de dados

const banco = new Pool({ connectionString: URL_BANCO });
// Uma conexão ociosa que cai não pode derrubar o processo
banco.on('error', (erro) => console.error('Erro na conexão com o banco:', erro.message));

// Cria a data (ISO 8601) de um dia do mês atual ao meio-dia, para que o fuso
// horário não empurre o gasto para o dia ou mês vizinho
function dataDoMes(dia, deslocamentoDeMeses = 0) {
  const hoje = new Date();
  const diaSeguro = deslocamentoDeMeses === 0 ? Math.min(dia, hoje.getDate()) : dia;
  return new Date(hoje.getFullYear(), hoje.getMonth() + deslocamentoDeMeses, diaSeguro, 12).toISOString();
}

// Na primeira execução (tabela vazia), grava alguns gastos de exemplo
async function popularSeVazio() {
  const { rows } = await banco.query('SELECT COUNT(*)::int AS total FROM gastos');
  if (rows[0].total > 0) return;
  const exemplos = [
    ['Supermercado', 187.5, 'Alimentação', dataDoMes(1)],
    ['Uber para o trabalho', 24.9, 'Transporte', dataDoMes(2)],
    ['Cinema com amigos', 60, 'Lazer', dataDoMes(3)],
    ['Aluguel', 1200, 'Moradia', dataDoMes(1)],
    ['Assinatura de streaming', 39.9, 'Outros', dataDoMes(new Date().getDate())],
    ['Almoço de domingo', 82, 'Alimentação', dataDoMes(15, -1)],
    ['Gasolina', 210, 'Transporte', dataDoMes(20, -1)],
  ];
  for (const linha of exemplos) {
    await banco.query('INSERT INTO gastos (titulo, valor, categoria, data) VALUES ($1, $2, $3, $4)', linha);
  }
  console.log('Banco criado com gastos de exemplo.');
}

async function prepararBanco() {
  await banco.query(`
    CREATE TABLE IF NOT EXISTS gastos (
      id        SERIAL PRIMARY KEY,
      titulo    VARCHAR(80)   NOT NULL,
      valor     NUMERIC(12,2) NOT NULL CHECK (valor > 0),
      categoria VARCHAR(30)   NOT NULL,
      data      TIMESTAMPTZ   NOT NULL
    )
  `);
  if (process.argv.includes('--reset')) {
    await banco.query('TRUNCATE gastos RESTART IDENTITY');
    console.log('Banco apagado.');
  }
  await popularSeVazio();
}

// O banco devolve o id como número, o valor (NUMERIC) como texto e a data como Date;
// a API sempre devolve o id como texto, o valor como número e a data em ISO 8601
function paraJson(linha) {
  return {
    id: String(linha.id),
    titulo: linha.titulo,
    valor: Number(linha.valor),
    categoria: linha.categoria,
    data: linha.data.toISOString(),
  };
}

const consultas = {
  async listar() {
    return (await banco.query('SELECT * FROM gastos ORDER BY data DESC, id DESC')).rows;
  },
  async buscar(id) {
    return (await banco.query('SELECT * FROM gastos WHERE id = $1', [id])).rows[0];
  },
  async inserir(g) {
    const { rows } = await banco.query(
      'INSERT INTO gastos (titulo, valor, categoria, data) VALUES ($1, $2, $3, $4) RETURNING *',
      [g.titulo, g.valor, g.categoria, g.data],
    );
    return rows[0];
  },
  async atualizar(id, g) {
    const { rows } = await banco.query(
      'UPDATE gastos SET titulo = $1, valor = $2, categoria = $3, data = $4 WHERE id = $5 RETURNING *',
      [g.titulo, g.valor, g.categoria, g.data, id],
    );
    return rows[0];
  },
  async excluir(id) {
    await banco.query('DELETE FROM gastos WHERE id = $1', [id]);
  },
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
// A lista tem as origens exatas (protocolo + host + porta): localhost, 127.0.0.1 e os IPs desta
// máquina na porta do Expo Web, mais as definidas em CORS_ORIGINS (separadas por vírgula).
const PORTA_EXPO_WEB = /^\d+$/.test(process.env.CORS_PORTA || '') ? process.env.CORS_PORTA : '8081';

function origensPermitidas() {
  const hosts = ['localhost', '127.0.0.1'];
  for (const interfaceDeRede of Object.values(os.networkInterfaces()).flat()) {
    if (interfaceDeRede && interfaceDeRede.family === 'IPv4') hosts.push(interfaceDeRede.address);
  }
  const extras = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((texto) => texto.trim())
    .filter(Boolean);
  return new Set([...hosts.map((host) => `http://${host}:${PORTA_EXPO_WEB}`), ...extras]);
}

const ORIGENS_PERMITIDAS = origensPermitidas();

function cabecalhosCors(req) {
  const origem = req.headers.origin;
  if (typeof origem !== 'string' || !ORIGENS_PERMITIDAS.has(origem)) return {};
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
      responderJson(res, 200, cenario === 'vazio' ? [] : (await consultas.listar()).map(paraJson));
      return;
    }
    if (req.method === 'POST') {
      const { erros, gasto } = validarGasto(await lerCorpoJson(req), new Date().toISOString());
      if (erros) {
        responderJson(res, 400, { mensagem: erros.join(' '), erros });
        return;
      }
      responderJson(res, 201, paraJson(await consultas.inserir(gasto)));
      return;
    }
    responderJson(res, 405, { mensagem: 'Método não permitido.' });
    return;
  }

  // Item: /gastos/:id
  const idNumerico = idDaUrl(id);
  const existente = idNumerico === null ? undefined : await consultas.buscar(idNumerico);

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
    responderJson(res, 200, paraJson(await consultas.atualizar(idNumerico, gasto)));
    return;
  }
  if (req.method === 'DELETE') {
    if (!existente) return naoEncontrado(res);
    await consultas.excluir(idNumerico);
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

prepararBanco()
  .then(() => {
    servidor.listen(PORTA, () => {
      console.log(`API do Controle de Gastos rodando na porta ${PORTA} (cenário: ${cenarioAtivo})`);
      console.log('Banco de dados: PostgreSQL (conectado)');
      const enderecos = Object.values(os.networkInterfaces())
        .flat()
        .filter((interfaceDeRede) => interfaceDeRede && interfaceDeRede.family === 'IPv4' && !interfaceDeRede.internal)
        .map((interfaceDeRede) => `http://${interfaceDeRede.address}:${PORTA}`);
      console.log(`Use no app (EXPO_PUBLIC_API_URL): ${enderecos.join('  ou  ') || 'nenhum IP de rede encontrado'}`);
    });
  })
  .catch((erro) => {
    console.error('Não foi possível conectar ao PostgreSQL:', erro.message);
    console.error('Suba o banco com: docker compose up -d   (ou defina DATABASE_URL)');
    process.exit(1);
  });
