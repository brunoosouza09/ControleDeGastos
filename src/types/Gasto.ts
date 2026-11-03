// Tipos relacionados aos gastos do usuário

/** Categorias disponíveis para classificar um gasto */
export type Categoria =
  | 'Alimentação'
  | 'Transporte'
  | 'Lazer'
  | 'Moradia'
  | 'Outros';

/** Representa um único gasto registrado pelo usuário */
export interface Gasto {
  id: string;
  titulo: string;
  valor: number;
  categoria: Categoria;
  data: Date;
}

/**
 * Dados enviados à API para criar ou alterar um gasto.
 * O id é gerado pelo banco; a data, quando omitida, é a do momento do cadastro.
 */
export type GastoInput = Omit<Gasto, 'id' | 'data'>;
