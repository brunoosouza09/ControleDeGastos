import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { CORES_CATEGORIA } from '../constants/categorias';
import { cores } from '../constants/cores';
import { useGastosContext } from '../context/GastosContext';
import { useAviso } from '../context/AvisoContext';
import { DetalheGastoScreenProps } from '../navigation/tipos';
import { buscarGasto } from '../services/gastosService';
import { ehNaoEncontrado, textoDoErro, tituloDoErro } from '../services/mensagemDeErro';
import { Gasto } from '../types/Gasto';
import { confirmar } from '../utils/dialogos';
import { formatarData } from '../utils/formatarData';
import { formatarMoeda } from '../utils/formatarMoeda';

type Estado =
  | { tipo: 'carregando' }
  | { tipo: 'ok'; gasto: Gasto }
  | { tipo: 'naoEncontrado' }
  | { tipo: 'erro'; erro: unknown };

/**
 * Detalhe de um gasto. O id chega por parâmetro de rota; o gasto é buscado na API
 * (GET /gastos/:id) para mostrar a versão mais recente e tratar o caso de ele não existir mais.
 * Daqui o usuário pode editar ou excluir o gasto.
 */
export function DetalheGastoScreen({ route, navigation }: DetalheGastoScreenProps) {
  const { gastoId } = route.params;
  const { buscarGastoPorId, removerGasto, descartarGasto } = useGastosContext();
  const mostrarAviso = useAviso();
  const daLista = buscarGastoPorId(gastoId);
  const [estado, setEstado] = useState<Estado>(daLista ? { tipo: 'ok', gasto: daLista } : { tipo: 'carregando' });
  const [excluindo, setExcluindo] = useState(false);

  const consultar = useCallback(async () => {
    try {
      setEstado({ tipo: 'ok', gasto: await buscarGasto(gastoId) });
    } catch (erro) {
      if (ehNaoEncontrado(erro)) {
        descartarGasto(gastoId);
        setEstado({ tipo: 'naoEncontrado' });
      } else if (!daLista) {
        // Sem cópia local para mostrar: exibe o erro. Com cópia, segue mostrando o que já temos.
        setEstado({ tipo: 'erro', erro });
      }
    }
    // daLista só serve de fallback na primeira consulta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gastoId, descartarGasto]);

  useEffect(() => {
    consultar();
  }, [consultar]);

  // Ao voltar da edição, mostra os dados que acabaram de ser salvos
  useEffect(() => {
    if (daLista && estado.tipo === 'ok' && daLista !== estado.gasto) {
      setEstado({ tipo: 'ok', gasto: daLista });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daLista]);

  async function excluir(gasto: Gasto) {
    const ok = await confirmar(
      'Excluir gasto',
      `Deseja excluir "${gasto.titulo}" (${formatarMoeda(gasto.valor)})? Esta ação não pode ser desfeita.`,
      'Excluir'
    );
    if (!ok) return;

    setExcluindo(true);
    try {
      await removerGasto(gasto.id);
      mostrarAviso('Gasto excluído.');
      navigation.goBack();
    } catch (erro) {
      setExcluindo(false);
      if (ehNaoEncontrado(erro)) {
        descartarGasto(gasto.id);
        mostrarAviso('Este gasto já havia sido excluído.', 'erro');
        navigation.goBack();
        return;
      }
      mostrarAviso(`${tituloDoErro(erro)}: ${textoDoErro(erro)}`, 'erro');
    }
  }

  if (estado.tipo === 'carregando') {
    return (
      <View style={styles.centro}>
        <ActivityIndicator size="large" color={cores.primaria} />
        <Text style={styles.textoCentro}>Carregando gasto...</Text>
      </View>
    );
  }

  if (estado.tipo === 'naoEncontrado' || estado.tipo === 'erro') {
    const naoEncontrado = estado.tipo === 'naoEncontrado';
    return (
      <View style={styles.centro}>
        <Text style={styles.icone}>{naoEncontrado ? '🔍' : '⚠️'}</Text>
        <Text style={styles.tituloCentro}>
          {naoEncontrado ? 'Gasto não encontrado' : tituloDoErro(estado.tipo === 'erro' ? estado.erro : null)}
        </Text>
        <Text style={styles.textoCentro}>
          {naoEncontrado
            ? 'Este gasto foi excluído ou não existe mais no servidor.'
            : textoDoErro(estado.tipo === 'erro' ? estado.erro : null)}
        </Text>
        <View style={styles.botaoCentro}>
          {!naoEncontrado && (
            <View style={styles.espaco}>
              <BotaoPrimario titulo="Tentar novamente" onPress={() => { setEstado({ tipo: 'carregando' }); consultar(); }} />
            </View>
          )}
          <BotaoPrimario titulo="Voltar" variante="contorno" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  const { gasto } = estado;
  const corCategoria = CORES_CATEGORIA[gasto.categoria];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      <View style={styles.card}>
        <Text style={styles.titulo}>{gasto.titulo}</Text>
        <Text style={styles.valor}>{formatarMoeda(gasto.valor)}</Text>

        <View style={styles.linha}>
          <Text style={styles.rotulo}>Categoria</Text>
          <Text style={[styles.informacao, { color: corCategoria }]}>{gasto.categoria}</Text>
        </View>
        <View style={styles.linha}>
          <Text style={styles.rotulo}>Data</Text>
          <Text style={styles.informacao}>{formatarData(gasto.data)}</Text>
        </View>
      </View>

      <View style={styles.acoes}>
        <View style={styles.espaco}>
          <BotaoPrimario
            titulo="✏️  Editar"
            variante="contorno"
            desabilitado={excluindo}
            onPress={() => navigation.navigate('EditarGasto', { gastoId: gasto.id })}
          />
        </View>
        <BotaoPrimario titulo="🗑️  Excluir" variante="perigo" carregando={excluindo} onPress={() => excluir(gasto)} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
  conteudo: {
    padding: 20,
  },
  card: {
    backgroundColor: cores.fundoCard,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: cores.texto,
  },
  valor: {
    fontSize: 32,
    fontWeight: '700',
    color: cores.texto,
    marginTop: 8,
    marginBottom: 20,
  },
  linha: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
  },
  rotulo: {
    fontSize: 14,
    color: cores.textoSecundario,
    fontWeight: '600',
  },
  informacao: {
    fontSize: 14,
    color: cores.texto,
    fontWeight: '600',
  },
  acoes: {
    marginTop: 24,
  },
  espaco: {
    marginBottom: 12,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
    padding: 24,
  },
  icone: { fontSize: 40, marginBottom: 12 },
  tituloCentro: { fontSize: 18, fontWeight: '700', color: cores.texto, textAlign: 'center' },
  textoCentro: { fontSize: 14, color: cores.textoSecundario, textAlign: 'center', marginTop: 8 },
  botaoCentro: { alignSelf: 'stretch', marginTop: 24 },
});
