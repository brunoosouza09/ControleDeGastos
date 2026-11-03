import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FormularioGasto } from '../components/FormularioGasto';
import { useGastosContext } from '../context/GastosContext';
import { useAviso } from '../context/AvisoContext';
import { NovoGastoScreenProps } from '../navigation/tipos';
import { textoDoErro, tituloDoErro } from '../services/mensagemDeErro';
import { GastoInput } from '../types/Gasto';
import { cores } from '../constants/cores';

/** Cadastro de gasto: envia POST /gastos e volta para a Home quando a API confirma */
export function NovoGastoScreen({ navigation }: NovoGastoScreenProps) {
  const { adicionarGasto } = useGastosContext();
  const mostrarAviso = useAviso();
  const [erroDoServidor, setErroDoServidor] = useState<string | null>(null);

  async function salvar(dados: GastoInput): Promise<boolean> {
    setErroDoServidor(null);
    try {
      await adicionarGasto(dados);
      mostrarAviso('Gasto cadastrado com sucesso!');
      navigation.navigate('Inicio');
      return true;
    } catch (erro) {
      setErroDoServidor(`${tituloDoErro(erro)}: ${textoDoErro(erro)}`);
      return false;
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FormularioGasto
        titulo="Novo gasto"
        textoBotao="Salvar gasto"
        onSalvar={salvar}
        erroDoServidor={erroDoServidor}
        limparAoSalvar
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
  },
});
