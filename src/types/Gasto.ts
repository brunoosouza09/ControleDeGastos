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
 * Dados necessários para criar um novo gasto a partir do formulário.
 * O id e a data são gerados automaticamente ao salvar.
 */
export type NovoGastoInput = Omit<Gasto, 'id' | 'data'>;
