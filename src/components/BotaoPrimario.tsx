import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { cores } from '../constants/cores';

interface BotaoPrimarioProps {
  titulo: string;
  onPress: () => void;
}

/** Botão de ação principal, usado em formulários e na Home */
export function BotaoPrimario({ titulo, onPress }: BotaoPrimarioProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.botao, pressed && styles.botaoPressionado]}
    >
      <Text style={styles.texto}>{titulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: cores.primaria,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPressionado: {
    backgroundColor: cores.primariaEscura,
  },
  texto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
