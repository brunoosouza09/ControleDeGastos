import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Categoria } from '../types/Gasto';
import { CORES_CATEGORIA } from '../constants/categorias';
import { cores } from '../constants/cores';

interface CategoriaChipProps {
  nome: Categoria;
  selecionado: boolean;
  onPress: () => void;
}

/** Botão em formato de chip usado para selecionar uma categoria no formulário */
export function CategoriaChip({ nome, selecionado, onPress }: CategoriaChipProps) {
  const corCategoria = CORES_CATEGORIA[nome];

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: selecionado ? corCategoria : cores.fundoCard,
          borderColor: corCategoria,
        },
      ]}
    >
      <Text style={[styles.texto, { color: selecionado ? '#FFFFFF' : corCategoria }]}>
        {nome}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
    marginBottom: 8,
  },
  texto: {
    fontSize: 13,
    fontWeight: '600',
  },
});
