import { useCallback, useEffect, useState } from 'react';
import { Gasto, GastoInput } from '../types/Gasto';
import * as api from '../services/gastosService';

/** Situação da consulta à Web API */
export type StatusConsulta = 'carregando' | 'sucesso' | 'erro';

const ordenarPorData = (lista: Gasto[]) => [...lista].sort((a, b) => b.data.getTime() - a.data.getTime());

/**
 * Guarda os gastos vindos da Web API e o controle da consulta (carregando, sucesso ou erro).
 * As operações de criar, alterar e excluir chamam a API e, se ela confirmar,
 * atualizam a lista local; se falharem, o erro é repassado para a tela tratar.
 */
export function useGastos() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [status, setStatus] = useState<StatusConsulta>('carregando');
  const [erro, setErro] = useState<Error | null>(null);
  const [atualizando, setAtualizando] = useState(false);

  const buscarLista = useCallback(async () => {
    setErro(null);
    try {
      setGastos(ordenarPorData(await api.listarGastos()));
      setStatus('sucesso');
    } catch (e) {
      setErro(e instanceof Error ? e : new Error('Ocorreu um erro inesperado.'));
      setStatus('erro');
    }
  }, []);

  /** Carga completa: mostra a tela de "carregando" */
  const carregar = useCallback(async () => {
    setStatus('carregando');
    await buscarLista();
  }, [buscarLista]);

  /** "Puxar para atualizar": mantém a lista visível enquanto busca */
  const atualizar = useCallback(async () => {
    setAtualizando(true);
    await buscarLista();
    setAtualizando(false);
  }, [buscarLista]);

  // Busca os gastos assim que o app abre
  useEffect(() => {
    carregar();
  }, [carregar]);

  async function adicionarGasto(dados: GastoInput): Promise<Gasto> {
    const criado = await api.criarGasto(dados);
    setGastos((atual) => ordenarPorData([criado, ...atual]));
    return criado;
  }

  async function editarGasto(id: string, dados: GastoInput): Promise<Gasto> {
    const alterado = await api.atualizarGasto(id, dados);
    setGastos((atual) => ordenarPorData(atual.map((g) => (g.id === id ? alterado : g))));
    return alterado;
  }

  async function removerGasto(id: string): Promise<void> {
    await api.excluirGasto(id);
    setGastos((atual) => atual.filter((g) => g.id !== id));
  }

  /** Esquece um gasto que a API informou não existir mais (404) */
  const descartarGasto = useCallback((id: string) => {
    setGastos((atual) => atual.filter((g) => g.id !== id));
  }, []);

  function buscarGastoPorId(id: string): Gasto | undefined {
    return gastos.find((gasto) => gasto.id === id);
  }

  return {
    gastos,
    status,
    erro,
    atualizando,
    recarregar: carregar,
    atualizar,
    adicionarGasto,
    editarGasto,
    removerGasto,
    descartarGasto,
    buscarGastoPorId,
  };
}
