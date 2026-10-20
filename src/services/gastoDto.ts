import { CATEGORIAS } from '../constants/categorias';
import { Categoria, Gasto } from '../types/Gasto';
import { ErroDoServidor } from './erros';

/** Formato do gasto como a Web API envia: a data chega como texto ISO 8601 */
export interface GastoDto {
  id: string;
  titulo: string;
  valor: number;
  categoria: string;
  data: string;
}

/** Converte o JSON recebido da API no tipo Gasto usado pelo app (data vira Date) */
export function converterGasto(dto: GastoDto): Gasto {
  const valor = Number(dto.valor);
  const data = new Date(dto.data);

  if (typeof dto.titulo !== 'string' || Number.isNaN(valor) || Number.isNaN(data.getTime())) {
    throw new ErroDoServidor('O servidor enviou um gasto com dados inválidos.');
  }

  // Uma categoria que o app não conhece não deve quebrar a tela
  const categoria = CATEGORIAS.includes(dto.categoria as Categoria)
    ? (dto.categoria as Categoria)
    : 'Outros';

  return { id: String(dto.id), titulo: dto.titulo, valor, categoria, data };
}
