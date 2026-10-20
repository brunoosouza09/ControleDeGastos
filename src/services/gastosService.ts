import { Gasto } from '../types/Gasto';
import { URL_BASE_API } from './config';
import { ErroDoServidor } from './erros';
import { GastoDto, converterGasto } from './gastoDto';
import { buscarJson } from './http';

/** GET /gastos: busca na Web API todos os gastos cadastrados */
export async function listarGastos(): Promise<Gasto[]> {
  const corpo = await buscarJson<GastoDto[]>(`${URL_BASE_API}/gastos`);

  if (!Array.isArray(corpo)) {
    throw new ErroDoServidor('O servidor enviou uma resposta inesperada.');
  }

  return corpo.map(converterGasto);
}
