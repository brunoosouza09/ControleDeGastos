import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Categoria } from '../types/Gasto';
import { CORES_CATEGORIA } from '../constants/categorias';
import { cores } from '../constants/cores';
import { formatarMoeda } from '../utils/formatarMoeda';

interface BarraCategoriaProps {
  categoria: Categoria;
  valor: number;
  percentual: number; // de 0 a 100
}

/**
 * Barra horizontal do resumo, construída só com View + Flexbox
 * (a largura da barra é definida por uma porcentagem de estilo).
 */
export function BarraCategoria({ categoria, valor, percentual }: BarraCategoriaProps) {
  const corCategoria = CORES_CATEGORIA[categoria];
  const percentualSeguro = Math.min(Math.max(percentual, 0), 100);

  return (
    <View style={styles.container}>
      <View style={styles.cabecalho}>
        <Text style={styles.categoria}>{categoria}</Text>
        <Text style={styles.valor}>{formatarMoeda(valor)}</Text>
      </View>

      <View style={styles.trilha}>
        <View
          style={[
            styles.preenchimento,
            {
              width: `${percentualSeguro}%` as `${number}%`,
              backgroundColor: corCategoria,
            },
          ]}
        />
      </View>

      <Text style={styles.percentual}>{percentualSeguro.toFixed(0)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  cabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  categoria: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
  },
  valor: {
    fontSize: 14,
    fontWeight: '600',
    color: cores.texto,
  },
  trilha: {
    height: 10,
    backgroundColor: cores.borda,
    borderRadius: 5,
    overflow: 'hidden',
  },
  preenchimento: {
    height: '100%',
    borderRadius: 5,
  },
  percentual: {
    fontSize: 11,
    color: cores.textoSecundario,
    marginTop: 4,
    textAlign: 'right',
  },
});
