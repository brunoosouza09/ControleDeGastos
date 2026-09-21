import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Gasto } from '../types/Gasto';
import { CATEGORIAS } from '../constants/categorias';
import { BarraCategoria } from '../components/BarraCategoria';
import { ResumoCard } from '../components/ResumoCard';
import { cores } from '../constants/cores';
import { formatarMoeda } from '../utils/formatarMoeda';

interface ResumoScreenProps {
  gastos: Gasto[];
}

/** Tela de resumo: total gasto por categoria (barras) e total geral */
export function ResumoScreen({ gastos }: ResumoScreenProps) {
  const totalGeral = gastos.reduce((soma, gasto) => soma + gasto.valor, 0);

  const totaisPorCategoria = CATEGORIAS.map((categoria) => {
    const total = gastos
      .filter((gasto) => gasto.categoria === categoria)
      .reduce((soma, gasto) => soma + gasto.valor, 0);
    const percentual = totalGeral > 0 ? (total / totalGeral) * 100 : 0;
    return { categoria, total, percentual };
  }).filter((item) => item.total > 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <Text style={styles.titulo}>Resumo por categoria</Text>

      {totaisPorCategoria.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Ainda não há gastos suficientes para gerar o resumo.</Text>
        </View>
      ) : (
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
      )}

      <ResumoCard rotulo="Total geral" valor={formatarMoeda(totalGeral)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
  vazio: {
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 20,
  },
  vazioTexto: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
});
