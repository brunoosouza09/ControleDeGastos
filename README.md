# Controle de Gastos

App mobile de controle de gastos pessoais, desenvolvido em React Native (Expo) com TypeScript para o Projeto Integrador de Programação Mobile.

- **Checkpoint 01:** telas, componentes e estado local.
- **Checkpoint 02:** navegação com React Navigation e consumo de uma Web API REST. A documentação completa está em [`docs/checkpoint-02.md`](docs/checkpoint-02.md).

## Stack

- [Expo](https://expo.dev/) SDK 57 (template `blank-typescript`)
- React Native + TypeScript
- [React Navigation](https://reactnavigation.org/) 7 (abas inferiores + pilha)
- `fetch` nativo para consumir a Web API; hooks (`useState`, `useEffect`) e Context API para o estado
- Web API própria em Node puro, sem dependências (pasta `api/`)

## Funcionalidades

- **Início:** total gasto no mês e lista de gastos vindos da Web API; toque num gasto para ver o detalhe.
- **Detalhe do gasto:** título, valor, categoria e data (o id chega por parâmetro de rota).
- **Novo gasto:** formulário com título, valor e categoria, com validação de campos. Neste checkpoint o gasto fica só em memória (a API aceita apenas consulta).
- **Resumo:** total gasto por categoria (barras feitas com View + Flexbox) e total geral.
- **Estados da consulta:** carregando, com dados, sem registros, falha de comunicação e erro enviado pelo servidor, com botão "Tentar novamente".

## Estrutura de pastas

```
api/
  server.js     # Web API (GET /gastos) com cenários de simulação
src/
  components/   # GastoCard, CategoriaChip, BotaoPrimario, ResumoCard, BarraCategoria, EstadoDaConsulta
  screens/      # HomeScreen, NovoGastoScreen, ResumoScreen, DetalheGastoScreen
  navigation/   # AppNavigator (abas + pilha) e tipos das rotas
  services/     # comunicação com a API: config, http, erros, gastoDto, gastosService
  hooks/        # useGastos (dados recebidos e estado da consulta)
  context/      # GastosProvider / useGastosContext
  types/        # Gasto, Categoria
  constants/    # categorias e paleta de cores
  utils/        # formatarMoeda, formatarData
docs/           # documentação dos checkpoints
App.tsx         # provedor de estado + navegação
```

## Como rodar

```bash
npm install
npm run api       # terminal 1: Web API em http://localhost:3333
npx expo start    # terminal 2: app
```

- **Emulador Android ou navegador:** não precisa de configuração.
- **Celular físico (Expo Go):** copie `.env.example` para `.env.local` e informe em `EXPO_PUBLIC_API_URL` o IP do computador (a API mostra esse endereço ao iniciar). Celular e computador devem estar na mesma rede Wi-Fi.

Para demonstrar os estados, troque o cenário da API abrindo `/cenario/normal`, `/cenario/vazio`, `/cenario/lento` ou `/cenario/erro` (ou encerre a API para simular falha de comunicação) e toque em "Tentar novamente" no app. Detalhes em [`docs/checkpoint-02.md`](docs/checkpoint-02.md).

## Próximos passos

Checkpoints seguintes devem enviar dados à API (POST) e persistir informações localmente (AsyncStorage).
