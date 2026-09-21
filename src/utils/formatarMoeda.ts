/** Formata um número para o padrão de moeda brasileiro (ex.: R$ 1.234,56) */
export function formatarMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}
