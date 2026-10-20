import React, { ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { StatusConsulta } from '../hooks/useGastos';
import { ErroDeRede, ErroDoServidor } from '../services/erros';
import { BotaoPrimario } from './BotaoPrimario';
import { cores } from '../constants/cores';

interface EstadoDaConsultaProps {
  status: StatusConsulta;
  erro: Error | null;
  vazio: boolean;
  mensagemVazio: string;
  onTentarNovamente: () => void;
  children: ReactNode;
}

/**
 * Mostra o que o usuário precisa ver em cada situação da consulta à API:
 * aguardando resposta, erro (de rede ou do servidor), sem registros ou os dados (children).
 */
export function EstadoDaConsulta({
  status,
  erro,
  vazio,
  mensagemVazio,
  onTentarNovamente,
  children,
}: EstadoDaConsultaProps) {
  if (status === 'carregando') {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={styles.texto}>Carregando gastos...</Text>
      </View>
    );
  }

  if (status === 'erro') {
    const falhaDeRede = erro instanceof ErroDeRede;
    const codigo = erro instanceof ErroDoServidor ? erro.status : undefined;

    return (
      <View style={styles.centro}>
        <Text style={styles.icone}>{falhaDeRede ? '📡' : '⚠️'}</Text>
        <Text style={styles.titulo}>
          {falhaDeRede ? 'Sem conexão com o servidor' : 'O servidor retornou um erro'}
        </Text>
        <Text style={styles.texto}>{erro?.message}</Text>
        {codigo !== undefined && <Text style={styles.codigo}>Código {codigo}</Text>}
        <View style={styles.botao}>
          <BotaoPrimario titulo="Tentar novamente" onPress={onTentarNovamente} />
        </View>
      </View>
    );
  }

  if (vazio) {
    return (
      <View style={styles.centro}>
        <Text style={styles.icone}>🧾</Text>
        <Text style={styles.texto}>{mensagemVazio}</Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  icone: {
    fontSize: 40,
    marginBottom: 12,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: cores.texto,
    textAlign: 'center',
    marginBottom: 8,
  },
  texto: {
    fontSize: 14,
    color: cores.textoSecundario,
    textAlign: 'center',
    marginTop: 8,
  },
  codigo: {
    fontSize: 12,
    fontWeight: '600',
    color: cores.perigo,
    marginTop: 8,
  },
  botao: {
    alignSelf: 'stretch',
    marginTop: 24,
  },
});
