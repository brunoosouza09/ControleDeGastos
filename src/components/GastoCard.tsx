import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Categoria } from '../types/Gasto';
import { CORES_CATEGORIA } from '../constants/categorias';
import { cores } from '../constants/cores';
import { formatarMoeda } from '../utils/formatarMoeda';
import { formatarData } from '../utils/formatarData';

interface GastoCardProps {
  titulo: string;
  valor: number;
  categoria: Categoria;
  data: Date;
}

/** Card que exibe um gasto individual na lista da Home */
export function GastoCard({ titulo, valor, categoria, data }: GastoCardProps) {
  const corCategoria = CORES_CATEGORIA[categoria];

  return (
    <View style={styles.card}>
      <View style={[styles.marcador, { backgroundColor: corCategoria }]} />

      <View style={styles.info}>
        <Text style={styles.titulo} numberOfLines={1}>
          {titulo}
        </Text>
        <View style={styles.linhaDetalhes}>
          <Text style={[styles.categoria, { color: corCategoria }]}>{categoria}</Text>
          <Text style={styles.data}>{formatarData(data)}</Text>
        </View>
      </View>

      <Text style={styles.valor}>{formatarMoeda(valor)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cores.fundoCard,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  marcador: {
    width: 4,
    height: 36,
    borderRadius: 2,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  titulo: {
    fontSize: 15,
    fontWeight: '600',
    color: cores.texto,
    marginBottom: 4,
  },
  linhaDetalhes: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoria: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 8,
  },
  data: {
    fontSize: 12,
    color: cores.textoSecundario,
  },
  valor: {
    fontSize: 15,
    fontWeight: '700',
    color: cores.texto,
    marginLeft: 8,
  },
});
