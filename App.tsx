import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Gasto, NovoGastoInput } from './src/types/Gasto';
import { Tela } from './src/types/Tela';
import { HomeScreen } from './src/screens/HomeScreen';
import { NovoGastoScreen } from './src/screens/NovoGastoScreen';
import { ResumoScreen } from './src/screens/ResumoScreen';
import { TabBar } from './src/components/TabBar';
import { cores } from './src/constants/cores';

// Gera um id simples, único o suficiente para a lista mantida em memória
function gerarId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// Garante que as datas de exemplo caiam sempre no mês atual,
// não importa em que dia o app seja executado
const hoje = new Date();
function criarDataDoMes(dia: number): Date {
  const diaSeguro = Math.min(dia, hoje.getDate());
  return new Date(hoje.getFullYear(), hoje.getMonth(), diaSeguro);
}

const GASTOS_EXEMPLO: Gasto[] = [
  {
    id: gerarId(),
    titulo: 'Supermercado',
    valor: 187.5,
    categoria: 'Alimentação',
    data: criarDataDoMes(3),
  },
  {
    id: gerarId(),
    titulo: 'Uber para o trabalho',
    valor: 24.9,
    categoria: 'Transporte',
    data: criarDataDoMes(5),
  },
  {
    id: gerarId(),
    titulo: 'Cinema com amigos',
    valor: 60,
    categoria: 'Lazer',
    data: criarDataDoMes(9),
  },
  {
    id: gerarId(),
    titulo: 'Aluguel',
    valor: 1200,
    categoria: 'Moradia',
    data: criarDataDoMes(10),
  },
  {
    id: gerarId(),
    titulo: 'Assinatura de streaming',
    valor: 39.9,
    categoria: 'Outros',
    data: criarDataDoMes(hoje.getDate()),
  },
];

export default function App() {
  // Estado central do app: tela atual e lista de gastos (lifting state up)
  const [telaAtiva, setTelaAtiva] = useState<Tela>('home');
  const [gastos, setGastos] = useState<Gasto[]>(GASTOS_EXEMPLO);

  function adicionarGasto(novoGasto: NovoGastoInput) {
    const gasto: Gasto = {
      ...novoGasto,
      id: gerarId(),
      data: new Date(),
    };
    setGastos((atual) => [gasto, ...atual]);
    setTelaAtiva('home'); // volta para a Home após salvar
  }

  return (
    <SafeAreaView style={styles.area}>
      <StatusBar style="dark" />

      {telaAtiva === 'home' && (
        <HomeScreen gastos={gastos} onNovoGasto={() => setTelaAtiva('novoGasto')} />
      )}
      {telaAtiva === 'novoGasto' && <NovoGastoScreen onSalvar={adicionarGasto} />}
      {telaAtiva === 'resumo' && <ResumoScreen gastos={gastos} />}

      <TabBar telaAtiva={telaAtiva} onTrocarTela={setTelaAtiva} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
});
