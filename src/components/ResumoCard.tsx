import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { cores } from '../constants/cores';

interface ResumoCardProps {
  rotulo: string;
  valor: string;
}

/** Card simples para destacar um rótulo e um valor (ex.: total do mês, total geral) */
export function ResumoCard({ rotulo, valor }: ResumoCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <Text style={styles.valor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
  rotulo: {
    fontSize: 13,
    color: cores.textoSecundario,
    marginBottom: 6,
    fontWeight: '600',
  },
  valor: {
    fontSize: 28,
    color: cores.texto,
    fontWeight: '700',
  },
});
