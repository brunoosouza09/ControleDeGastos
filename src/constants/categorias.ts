import { Categoria } from '../types/Gasto';
import { cores } from './cores';

/** Lista fixa de categorias usadas no formulário e no resumo */
export const CATEGORIAS: Categoria[] = [
  'Alimentação',
  'Transporte',
  'Lazer',
  'Moradia',
  'Outros',
];

/** Cor associada a cada categoria, usada em chips, cards e barras do resumo */
export const CORES_CATEGORIA: Record<Categoria, string> = {
  Alimentação: cores.categoriaAlimentacao,
  Transporte: cores.categoriaTransporte,
  Lazer: cores.categoriaLazer,
  Moradia: cores.categoriaMoradia,
  Outros: cores.categoriaOutros,
};
