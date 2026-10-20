import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIAS } from '../constants/categorias';
import { BarraCategoria } from '../components/BarraCategoria';
import { EstadoDaConsulta } from '../components/EstadoDaConsulta';
import { ResumoCard } from '../components/ResumoCard';
import { useGastosContext } from '../context/GastosContext';
import { cores } from '../constants/cores';
import { formatarMoeda } from '../utils/formatarMoeda';

/** Tela de resumo: total gasto por categoria (barras) e total geral */
export function ResumoScreen() {
  const { gastos, status, erro, recarregar } = useGastosContext();

  const totalGeral = gastos.reduce((soma, gasto) => soma + gasto.valor, 0);

  const totaisPorCategoria = CATEGORIAS.map((categoria) => {
    const total = gastos
      .filter((gasto) => gasto.categoria === categoria)
      .reduce((soma, gasto) => soma + gasto.valor, 0);
    const percentual = totalGeral > 0 ? (total / totalGeral) * 100 : 0;
    return { categoria, total, percentual };
  }).filter((item) => item.total > 0);

  return (
    <SafeAreaView style={styles.area} edges={['top']}>
      <EstadoDaConsulta
        status={status}
        erro={erro}
        vazio={gastos.length === 0}
        mensagemVazio="Ainda não há gastos suficientes para gerar o resumo."
        onTentarNovamente={recarregar}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
          <Text style={styles.titulo}>Resumo por categoria</Text>

          <View style={styles.barras}>
            {totaisPorCategoria.map((item) => (
              <BarraCategoria
                key={item.categoria}
                categoria={item.categoria}
                valor={item.total}
                percentual={item.percentual}
              />
            ))}
          </View>

          <ResumoCard rotulo="Total geral" valor={formatarMoeda(totalGeral)} />
        </ScrollView>
      </EstadoDaConsulta>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    padding: 20,
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: cores.texto,
    marginBottom: 20,
  },
  barras: {
    backgroundColor: cores.fundoCard,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
});
