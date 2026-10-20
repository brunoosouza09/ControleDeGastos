// Erros lançados pela camada de comunicação com a Web API.
// Separar os dois tipos permite à interface explicar ao usuário o que aconteceu.

/** Falha de comunicação: sem internet, API desligada ou tempo de resposta esgotado */
export class ErroDeRede extends Error {
  constructor(
    mensagem = 'Não foi possível se comunicar com o servidor. Verifique a conexão e se a API está em execução.'
  ) {
    super(mensagem);
    this.name = 'ErroDeRede';
  }
}

/** O servidor respondeu, mas com erro (status fora de 2xx) ou com dados inesperados */
export class ErroDoServidor extends Error {
  status?: number;

  constructor(mensagem: string, status?: number) {
    super(mensagem);
    this.name = 'ErroDoServidor';
    this.status = status;
  }
}
