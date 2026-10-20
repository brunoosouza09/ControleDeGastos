import React, { ReactNode, createContext, useContext } from 'react';
import { useGastos } from '../hooks/useGastos';

type GastosContextValor = ReturnType<typeof useGastos>;

const GastosContext = createContext<GastosContextValor | null>(null);

/** Disponibiliza os gastos (e o estado da consulta à API) para todas as telas */
export function GastosProvider({ children }: { children: ReactNode }) {
  const valor = useGastos();
  return <GastosContext.Provider value={valor}>{children}</GastosContext.Provider>;
}

export function useGastosContext(): GastosContextValor {
  const valor = useContext(GastosContext);
  if (!valor) {
    throw new Error('useGastosContext deve ser usado dentro de um GastosProvider.');
  }
  return valor;
}
