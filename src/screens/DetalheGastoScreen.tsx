import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CORES_CATEGORIA } from '../constants/categorias';
import { cores } from '../constants/cores';
import { useGastosContext } from '../context/GastosContext';
import { DetalheGastoScreenProps } from '../navigation/tipos';
import { formatarData } from '../utils/formatarData';
import { formatarMoeda } from '../utils/formatarMoeda';

/** Detalhe de um gasto: o id chega por parâmetro de rota e o gasto é buscado no contexto */
export function DetalheGastoScreen({ route }: DetalheGastoScreenProps) {
  const { gastoId } = route.params;
  const { buscarGastoPorId } = useGastosContext();
  const gasto = buscarGastoPorId(gastoId);

  if (!gasto) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.vazioTexto}>Este gasto não está mais disponível.</Text>
      </View>
    );
  }

  const corCategoria = CORES_CATEGORIA[gasto.categoria];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.titulo}>{gasto.titulo}</Text>
        <Text style={styles.valor}>{formatarMoeda(gasto.valor)}</Text>

        <View style={styles.linha}>
          <Text style={styles.rotulo}>Categoria</Text>
          <Text style={[styles.informacao, { color: corCategoria }]}>{gasto.categoria}</Text>
        </View>
        <View style={styles.linha}>
          <Text style={styles.rotulo}>Data</Text>
          <Text style={styles.informacao}>{formatarData(gasto.data)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: 20,
  },
  card: {
    backgroundColor: cores.fundoCard,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: cores.texto,
  },
  valor: {
    fontSize: 32,
    fontWeight: '700',
    color: cores.texto,
    marginTop: 8,
    marginBottom: 20,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  rotulo: {
    fontSize: 14,
    color: cores.textoSecundario,
    fontWeight: '600',
  },
  informacao: {
    fontSize: 14,
    color: cores.texto,
    fontWeight: '600',
  },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
    padding: 20,
  },
  vazioTexto: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
});
