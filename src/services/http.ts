import { ErroDeRede, ErroDoServidor } from './erros';

const TEMPO_LIMITE_MS = 8000;

/** Lê a mensagem de erro enviada pelo servidor ({ "mensagem": "..." }), se houver */
async function lerMensagemDeErro(resposta: Response): Promise<string> {
  try {
    const corpo = await resposta.json();
    if (typeof corpo?.mensagem === 'string') {
      return corpo.mensagem;
    }
  } catch {
    // corpo vazio ou que não é JSON: usa a mensagem padrão abaixo
  }
  return `O servidor respondeu com o status ${resposta.status}.`;
}

/**
 * Faz uma requisição GET e devolve o JSON da resposta já convertido.
 * Falhas de comunicação viram ErroDeRede; respostas com erro viram ErroDoServidor.
 */
export async function buscarJson<T>(url: string): Promise<T> {
  // Sem limite de tempo, o fetch pode ficar pendurado quando o IP não responde
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), TEMPO_LIMITE_MS);

  try {
    let resposta: Response;
    try {
      resposta = await fetch(url, {
        headers: { Accept: 'application/json' },
        signal: controlador.signal,
      });
    } catch {
      throw new ErroDeRede();
    }

    if (!resposta.ok) {
      throw new ErroDoServidor(await lerMensagemDeErro(resposta), resposta.status);
    }

    try {
      return (await resposta.json()) as T;
    } catch {
      // O tempo esgotou durante a leitura do corpo, ou o corpo não é um JSON válido
      if (controlador.signal.aborted) {
        throw new ErroDeRede();
      }
      throw new ErroDoServidor('O servidor enviou uma resposta em formato inválido.', resposta.status);
    }
  } finally {
    clearTimeout(temporizador);
  }
}
