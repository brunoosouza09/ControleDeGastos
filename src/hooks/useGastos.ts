import { useCallback, useEffect, useMemo, useState } from 'react';
import { Gasto, NovoGastoInput } from '../types/Gasto';
import { listarGastos } from '../services/gastosService';

/** Situação da consulta à Web API */
export type StatusConsulta = 'carregando' | 'sucesso' | 'erro';

// Gera um id para gastos cadastrados no app; o prefixo evita colisão com os ids da API
function gerarIdLocal(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Guarda os gastos vindos da Web API junto com o controle da consulta
 * (carregando, sucesso ou erro) e os gastos cadastrados localmente no app.
 */
export function useGastos() {
  const [gastosDaApi, setGastosDaApi] = useState<Gasto[]>([]);
  const [gastosLocais, setGastosLocais] = useState<Gasto[]>([]);
  const [status, setStatus] = useState<StatusConsulta>('carregando');
  const [erro, setErro] = useState<Error | null>(null);

  const carregar = useCallback(async () => {
    setStatus('carregando');
    setErro(null);
    try {
      setGastosDaApi(await listarGastos());
      setStatus('sucesso');
    } catch (e) {
      setErro(e instanceof Error ? e : new Error('Ocorreu um erro inesperado.'));
      setStatus('erro');
    }
  }, []);

  // Busca os gastos assim que o app abre
  useEffect(() => {
    carregar();
  }, [carregar]);

  // Os gastos cadastrados no app ainda não são enviados à API (só GET neste checkpoint)
  function adicionarGasto(novoGasto: NovoGastoInput) {
    const gasto: Gasto = { ...novoGasto, id: gerarIdLocal(), data: new Date() };
    setGastosLocais((atual) => [gasto, ...atual]);
  }

  const gastos = useMemo(() => [...gastosLocais, ...gastosDaApi], [gastosLocais, gastosDaApi]);

  function buscarGastoPorId(id: string): Gasto | undefined {
    return gastos.find((gasto) => gasto.id === id);
  }

  return { gastos, status, erro, recarregar: carregar, adicionarGasto, buscarGastoPorId };
}
