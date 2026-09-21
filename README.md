# Controle de Gastos

App mobile de controle de gastos pessoais, desenvolvido em React Native (Expo) com TypeScript como Checkpoint 01 do Projeto Integrador de Programação Mobile.

## Stack

- [Expo](https://expo.dev/) (template `blank-typescript`)
- React Native + TypeScript
- Apenas componentes básicos do React Native e hooks (`useState`) — sem bibliotecas de navegação, estado global ou armazenamento neste checkpoint.

## Funcionalidades

- **Início:** saldo/total gasto no mês e lista dos gastos cadastrados.
- **Novo Gasto:** formulário com título, valor e categoria, com validação de campos.
- **Resumo:** total gasto por categoria (barras feitas com View + Flexbox) e total geral.

Navegação entre as telas é controlada por `useState` no `App.tsx`, com uma barra de abas própria (`TabBar`).

## Estrutura de pastas

```
src/
  components/   # GastoCard, CategoriaChip, BotaoPrimario, ResumoCard, BarraCategoria, TabBar
  screens/      # HomeScreen, NovoGastoScreen, ResumoScreen
  types/        # Gasto, Categoria, Tela
  constants/    # categorias e paleta de cores
  utils/        # formatarMoeda, formatarData
App.tsx         # estado central (lista de gastos e tela ativa)
```

## Como rodar

```bash
npm install
npx expo start
```

Escaneie o QR code com o app **Expo Go** (Android/iOS) ou rode em um emulador Android/iOS.

## Próximos passos

Checkpoints seguintes devem adicionar navegação (React Navigation), persistência local (AsyncStorage) e possivelmente gerenciamento de estado global.
