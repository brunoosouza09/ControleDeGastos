import { Gasto, GastoInput } from '../types/Gasto';
import { URL_BASE_API } from './config';
import { ErroDoServidor } from './erros';
import { GastoDto, converterGasto } from './gastoDto';
import { requisitarJson } from './http';

const URL_GASTOS = `${URL_BASE_API}/gastos`;

/** GET /gastos: busca todos os gastos cadastrados */
export async function listarGastos(): Promise<Gasto[]> {
  const corpo = await requisitarJson<GastoDto[]>(URL_GASTOS);
  if (!Array.isArray(corpo)) {
    throw new ErroDoServidor('O servidor enviou uma resposta inesperada.');
  }
  return corpo.map(converterGasto);
}

/** GET /gastos/:id: busca um gasto (404 vira ErroDoServidor com status 404) */
export async function buscarGasto(id: string): Promise<Gasto> {
  return converterGasto(await requisitarJson<GastoDto>(`${URL_GASTOS}/${encodeURIComponent(id)}`));
}

/** POST /gastos: cria um gasto e devolve o registro gravado (com id e data) */
export async function criarGasto(dados: GastoInput): Promise<Gasto> {
  return converterGasto(await requisitarJson<GastoDto>(URL_GASTOS, 'POST', dados));
}

/** PUT /gastos/:id: altera um gasto e devolve o registro atualizado */
export async function atualizarGasto(id: string, dados: GastoInput): Promise<Gasto> {
  return converterGasto(
    await requisitarJson<GastoDto>(`${URL_GASTOS}/${encodeURIComponent(id)}`, 'PUT', dados)
  );
}

/** DELETE /gastos/:id: exclui um gasto */
export async function excluirGasto(id: string): Promise<void> {
  await requisitarJson<void>(`${URL_GASTOS}/${encodeURIComponent(id)}`, 'DELETE');
}
