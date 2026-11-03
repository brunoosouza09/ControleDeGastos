import { ErroDeRede, ErroDoServidor } from './erros';

/** Título curto que explica ao usuário que tipo de problema aconteceu */
export function tituloDoErro(erro: unknown): string {
  if (erro instanceof ErroDeRede) return 'Sem conexão com o servidor';
  if (erro instanceof ErroDoServidor) {
    if (erro.status === 400) return 'Dados inválidos';
    if (erro.status === 404) return 'Gasto não encontrado';
    if (erro.status !== undefined && erro.status >= 500) return 'O servidor retornou um erro';
  }
  return 'Não foi possível concluir';
}

/** Texto do erro para exibir ao usuário */
export function textoDoErro(erro: unknown): string {
  return erro instanceof Error ? erro.message : 'Ocorreu um erro inesperado.';
}

/** true quando a API respondeu 404 (o registro não existe mais) */
export function ehNaoEncontrado(erro: unknown): boolean {
  return erro instanceof ErroDoServidor && erro.status === 404;
}
