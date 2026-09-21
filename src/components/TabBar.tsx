import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Tela } from '../types/Tela';
import { cores } from '../constants/cores';

interface TabBarProps {
  telaAtiva: Tela;
  onTrocarTela: (tela: Tela) => void;
}

interface ItemTab {
  chave: Tela;
  rotulo: string;
  icone: string;
}

const ITENS: ItemTab[] = [
  { chave: 'home', rotulo: 'Início', icone: '🏠' },
  { chave: 'novoGasto', rotulo: 'Novo', icone: '➕' },
  { chave: 'resumo', rotulo: 'Resumo', icone: '📊' },
];

/** Barra de navegação inferior simples, controlada pelo estado do App */
export function TabBar({ telaAtiva, onTrocarTela }: TabBarProps) {
  return (
    <View style={styles.container}>
      {ITENS.map((item) => {
        const ativo = item.chave === telaAtiva;
        return (
          <Pressable key={item.chave} style={styles.item} onPress={() => onTrocarTela(item.chave)}>
            <Text style={styles.icone}>{item.icone}</Text>
            <Text style={[styles.rotulo, ativo && styles.rotuloAtivo]}>{item.rotulo}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: cores.fundoCard,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    paddingBottom: 20,
    paddingTop: 10,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icone: {
    fontSize: 18,
    marginBottom: 2,
  },
  rotulo: {
    fontSize: 12,
    color: cores.textoSecundario,
    fontWeight: '600',
  },
  rotuloAtivo: {
    color: cores.primaria,
  },
});
