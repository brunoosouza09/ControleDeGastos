import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FormularioGasto } from '../components/FormularioGasto';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { useGastosContext } from '../context/GastosContext';
import { useAviso } from '../context/AvisoContext';
import { EditarGastoScreenProps } from '../navigation/tipos';
import { ehNaoEncontrado, textoDoErro, tituloDoErro } from '../services/mensagemDeErro';
import { GastoInput } from '../types/Gasto';
import { cores } from '../constants/cores';

/** Edição de gasto: recebe o id por parâmetro, envia PUT /gastos/:id e volta ao detalhe */
export function EditarGastoScreen({ route, navigation }: EditarGastoScreenProps) {
  const { gastoId } = route.params;
  const { buscarGastoPorId, editarGasto, descartarGasto } = useGastosContext();
  const mostrarAviso = useAviso();
  const [erroDoServidor, setErroDoServidor] = useState<string | null>(null);
  const gasto = buscarGastoPorId(gastoId);

  if (!gasto) {
    return (
      <View style={styles.vazio}>
        <Text style={styles.icone}>🔍</Text>
        <Text style={styles.vazioTexto}>Este gasto não está mais disponível.</Text>
        <View style={styles.botao}>
          <BotaoPrimario titulo="Voltar" variante="contorno" onPress={() => navigation.goBack()} />
        </View>
      </View>
    );
  }

  async function salvar(dados: GastoInput): Promise<boolean> {
    setErroDoServidor(null);
    try {
      await editarGasto(gastoId, dados);
      mostrarAviso('Alterações salvas!');
      navigation.goBack();
      return true;
    } catch (erro) {
      if (ehNaoEncontrado(erro)) {
        // Outro dispositivo já excluiu o gasto: tira da lista e volta para a Home
        descartarGasto(gastoId);
        mostrarAviso('Este gasto não existe mais no servidor.', 'erro');
        navigation.popToTop();
        return false;
      }
      setErroDoServidor(`${tituloDoErro(erro)}: ${textoDoErro(erro)}`);
      return false;
    }
  }

  return (
    <View style={styles.container}>
      <FormularioGasto
        textoBotao="Salvar alterações"
        inicial={{ titulo: gasto.titulo, valor: gasto.valor, categoria: gasto.categoria }}
        onSalvar={salvar}
        erroDoServidor={erroDoServidor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: cores.fundo },
  vazio: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: cores.fundo,
    padding: 24,
  },
  icone: { fontSize: 40, marginBottom: 12 },
  vazioTexto: { fontSize: 14, color: cores.textoSecundario, textAlign: 'center' },
  botao: { alignSelf: 'stretch', marginTop: 24 },
});
