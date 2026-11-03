# Controle de Gastos

App mobile de controle de gastos pessoais, desenvolvido em React Native (Expo) com TypeScript para o Projeto Integrador de Programação Mobile (Toledo Prudente Centro Universitário).

- **Checkpoint 01:** telas, componentes e estado local.
- **Checkpoint 02:** navegação com React Navigation e consumo de uma Web API REST ([`docs/checkpoint-02.md`](docs/checkpoint-02.md)).
- **Checkpoint 03 (entrega final):** CRUD completo com a Web API, banco de dados SQLite, edição e exclusão, e tratamento de erros em todas as operações ([`docs/checkpoint-03.md`](docs/checkpoint-03.md)).

## Stack

- [Expo](https://expo.dev/) SDK 57, React Native, TypeScript
- [React Navigation](https://reactnavigation.org/) 7 (abas inferiores + pilha)
- `fetch` nativo; hooks (`useState`, `useEffect`, `useCallback`) e Context API para o estado
- **Web API** própria em Node.js puro (pasta `api/`), sem dependências externas
- **Banco de dados** SQLite, pelo módulo nativo `node:sqlite` do Node.js (arquivo `api/gastos.db`)

## Funcionalidades

| Tela | O que faz | Requisição |
|---|---|---|
| Início | Total do mês e lista de gastos; puxe para atualizar; toque num gasto para ver o detalhe | `GET /gastos` |
| Novo gasto | Formulário com validação por campo; salva na API e volta para o Início | `POST /gastos` |
| Detalhe | Busca o gasto atualizado na API; botões Editar e Excluir (com confirmação) | `GET /gastos/:id`, `DELETE /gastos/:id` |
| Editar gasto | Mesmo formulário, já preenchido; recebe o id por parâmetro de rota | `PUT /gastos/:id` |
| Resumo | Total por categoria (barras com Flexbox) e total geral | (dados do Início) |

Feedback ao usuário: indicador de carregamento, botão com "carregando" durante o envio, aviso (toast) de sucesso, mensagem de lista vazia, erros por campo e caixa de erro com a mensagem do servidor.

## Como executar

Pré-requisitos: **Node.js 22.5 ou superior** (o banco usa o módulo nativo `node:sqlite`) e o app **Expo Go** no celular, se for testar num aparelho.

```bash
npm install

# Terminal 1: Web API + banco de dados (http://localhost:3333)
npm run api

# Terminal 2: app
npx expo start          # depois: "w" abre no navegador, ou leia o QR code com o Expo Go
```

### Banco de dados

Não precisa instalar nada. Na primeira execução de `npm run api`, o arquivo `api/gastos.db` é criado com a tabela `gastos` e alguns gastos de exemplo. Os dados ficam gravados entre execuções.

- Para voltar aos dados de exemplo: `npm run api:reset` (apaga os gastos e grava os exemplos de novo).
- Para usar outro arquivo: defina a variável `DB_PATH`.

Tabela `gastos`: `id` (INTEGER, chave primária autoincremento), `titulo` (TEXT), `valor` (REAL, > 0), `categoria` (TEXT), `data` (TEXT, ISO 8601).

### Endereço da API no app

- **Navegador ou emulador Android:** funciona sem configuração (`localhost` / `10.0.2.2`).
- **Celular físico (Expo Go) ou navegador em outro computador:** copie `.env.example` para `.env.local` e informe em `EXPO_PUBLIC_API_URL` o IP do computador que roda a API (o terminal da API mostra esse endereço). Os aparelhos devem estar na mesma rede Wi-Fi. Reinicie o `expo start` após mudar o arquivo.

## Web API

| Método | Rota | Corpo | Respostas |
|---|---|---|---|
| GET | `/gastos` | | 200 lista |
| GET | `/gastos/:id` | | 200 gasto, 404 |
| POST | `/gastos` | `{ titulo, valor, categoria, data? }` | 201 gasto criado, 400 validação |
| PUT | `/gastos/:id` | `{ titulo, valor, categoria, data? }` | 200 gasto alterado, 400, 404 |
| DELETE | `/gastos/:id` | | 204, 404 |

Erros sempre vêm como `{ "mensagem": "..." }` (no 400, também `erros: [...]`).
POST e PUT exigem `Content-Type: application/json` (senão 415), e o CORS só libera o Expo Web na porta 8081 (`CORS_PORTA` muda). Categorias aceitas: Alimentação, Transporte, Lazer, Moradia, Outros.

Exemplo:

```bash
curl -X POST http://localhost:3333/gastos -H "Content-Type: application/json" \
  -d '{"titulo":"Almoço","valor":32.5,"categoria":"Alimentação"}'
```

### Demonstrar os erros tratados

| Situação | Como provocar |
|---|---|
| Carregamento | abrir `http://localhost:3333/cenario/lento` (respostas demoram 3 s) |
| Lista vazia | `/cenario/vazio` |
| Erro HTTP do servidor (500) | `/cenario/erro`, depois tentar listar, salvar ou excluir |
| API indisponível / falha de conexão | encerrar a API (Ctrl+C) e tocar em "Tentar novamente" |
| Dado não encontrado (404) | excluir um gasto pela API (`curl -X DELETE .../gastos/1`) e abri-lo no app |
| Erro de validação | salvar o formulário vazio (validação no app) ou enviar dados inválidos via `curl` (400 da API) |

Volte ao normal com `/cenario/normal`.

## Estrutura de pastas

```
api/
  server.js       # Web API REST (CRUD) + banco SQLite + cenários de demonstração
src/
  components/     # GastoCard, FormularioGasto, BotaoPrimario, CategoriaChip, ResumoCard, BarraCategoria, EstadoDaConsulta
  screens/        # HomeScreen, NovoGastoScreen, DetalheGastoScreen, EditarGastoScreen, ResumoScreen
  navigation/     # AppNavigator (abas + pilha) e tipos das rotas
  services/       # config, http (fetch com tempo limite), erros, gastoDto, gastosService, mensagemDeErro
  hooks/          # useGastos (lista, estado da consulta e operações de CRUD)
  context/        # GastosContext (dados) e AvisoContext (toast de feedback)
  types/          # Gasto, GastoInput, Categoria
  constants/      # categorias e paleta de cores
  utils/          # formatarMoeda, formatarData, dialogos (alert/confirm em celular e web)
docs/             # documentação dos checkpoints
App.tsx           # provedores + navegação
```
