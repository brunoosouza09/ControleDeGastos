import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { cores } from '../constants/cores';

type Variante = 'primario' | 'perigo' | 'contorno';

interface BotaoPrimarioProps {
  titulo: string;
  onPress: () => void;
  /** Mostra um indicador no lugar do texto e bloqueia novos toques */
  carregando?: boolean;
  desabilitado?: boolean;
  variante?: Variante;
}

const ESTILO_PRESSIONADO = {
  primario: { backgroundColor: cores.primariaEscura },
  perigo: { backgroundColor: cores.perigoEscuro },
  contorno: { backgroundColor: cores.borda },
};

/** Botão de ação usado em formulários, na Home e no detalhe */
export function BotaoPrimario({
  titulo,
  onPress,
  carregando = false,
  desabilitado = false,
  variante = 'primario',
}: BotaoPrimarioProps) {
  const inativo = carregando || desabilitado;
  const corTexto = variante === 'contorno' ? cores.primaria : '#FFFFFF';

  return (
    <Pressable
      onPress={onPress}
      disabled={inativo}
      accessibilityRole="button"
      accessibilityState={{ disabled: inativo, busy: carregando }}
      style={({ pressed }) => [
        styles.botao,
        styles[variante],
        pressed && ESTILO_PRESSIONADO[variante],
        inativo && styles.inativo,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <Text style={[styles.texto, { color: corTexto }]}>{titulo}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  botao: {
    minHeight: 50,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: { backgroundColor: cores.primaria },
  perigo: { backgroundColor: cores.perigo },
  contorno: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: cores.primaria },
  inativo: { opacity: 0.6 },
  texto: {
    fontSize: 16,
    fontWeight: '700',
  },
});
