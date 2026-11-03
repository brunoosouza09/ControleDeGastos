import React, { ReactNode, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores } from '../constants/cores';

type TipoAviso = 'sucesso' | 'erro';
interface Aviso {
  texto: string;
  tipo: TipoAviso;
  chave: number;
}

const DURACAO_MS = 2500;

const AvisoContext = createContext<((texto: string, tipo?: TipoAviso) => void) | null>(null);

/**
 * Aviso curto (toast) no topo da tela, usado como feedback visual das ações:
 * "Gasto cadastrado", "Gasto excluído", etc. Some sozinho após alguns segundos.
 */
export function AvisoProvider({ children }: { children: ReactNode }) {
  const [aviso, setAviso] = useState<Aviso | null>(null);
  const opacidade = useRef(new Animated.Value(0)).current;
  const margens = useSafeAreaInsets();

  const mostrarAviso = useCallback((texto: string, tipo: TipoAviso = 'sucesso') => {
    setAviso({ texto, tipo, chave: Date.now() });
  }, []);

  useEffect(() => {
    if (!aviso) return;
    opacidade.setValue(0);
    Animated.timing(opacidade, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    const temporizador = setTimeout(() => {
      Animated.timing(opacidade, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => setAviso(null));
    }, DURACAO_MS);
    return () => clearTimeout(temporizador);
  }, [aviso, opacidade]);

  return (
    <AvisoContext.Provider value={mostrarAviso}>
      {children}
      {aviso ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[
            styles.aviso,
            { top: margens.top + 8, opacity: opacidade },
            aviso.tipo === 'erro' ? styles.erro : styles.sucesso,
          ]}
        >
          <Text style={styles.texto}>{aviso.texto}</Text>
        </Animated.View>
      ) : null}
    </AvisoContext.Provider>
  );
}

export function useAviso() {
  const valor = useContext(AvisoContext);
  if (!valor) {
    throw new Error('useAviso deve ser usado dentro de um AvisoProvider.');
  }
  return valor;
}

const styles = StyleSheet.create({
  aviso: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  sucesso: { backgroundColor: cores.sucesso },
  erro: { backgroundColor: cores.perigo },
  texto: { color: '#FFFFFF', fontSize: 14, fontWeight: '700', textAlign: 'center' },
});
