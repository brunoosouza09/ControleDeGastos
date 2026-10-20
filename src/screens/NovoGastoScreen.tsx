import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Categoria } from '../types/Gasto';
import { CATEGORIAS } from '../constants/categorias';
import { CategoriaChip } from '../components/CategoriaChip';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { useGastosContext } from '../context/GastosContext';
import { NovoGastoScreenProps } from '../navigation/tipos';
import { cores } from '../constants/cores';

/** Tela de formulário para cadastrar um novo gasto */
export function NovoGastoScreen({ navigation }: NovoGastoScreenProps) {
  const { adicionarGasto } = useGastosContext();
  const [titulo, setTitulo] = useState('');
  const [valorTexto, setValorTexto] = useState('');
  const [categoria, setCategoria] = useState<Categoria | null>(null);

  function limparFormulario() {
    setTitulo('');
    setValorTexto('');
    setCategoria(null);
  }

  function validarESalvar() {
    const tituloLimpo = titulo.trim();
    const valorNumerico = Number(valorTexto.replace(',', '.'));

    if (tituloLimpo.length === 0) {
      Alert.alert('Título obrigatório', 'Informe um título para o gasto.');
      return;
    }

    if (valorTexto.trim().length === 0 || Number.isNaN(valorNumerico) || valorNumerico <= 0) {
      Alert.alert('Valor inválido', 'Informe um valor numérico maior que zero.');
      return;
    }

    if (!categoria) {
      Alert.alert('Categoria obrigatória', 'Selecione uma categoria para o gasto.');
      return;
    }

    adicionarGasto({ titulo: tituloLimpo, valor: valorNumerico, categoria });
    limparFormulario();
    navigation.navigate('Inicio'); // volta para a Home após salvar
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
          <Text style={styles.titulo}>Novo gasto</Text>

          <Text style={styles.rotulo}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: Almoço, Uber, Aluguel..."
            placeholderTextColor={cores.textoSecundario}
            value={titulo}
            onChangeText={setTitulo}
          />

          <Text style={styles.rotulo}>Valor (R$)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex.: 49,90"
            placeholderTextColor={cores.textoSecundario}
            value={valorTexto}
            onChangeText={setValorTexto}
            keyboardType="decimal-pad"
          />

          <Text style={styles.rotulo}>Categoria</Text>
          <View style={styles.chips}>
            {CATEGORIAS.map((item) => (
              <CategoriaChip
                key={item}
                nome={item}
                selecionado={categoria === item}
                onPress={() => setCategoria(item)}
              />
            ))}
          </View>

          <View style={styles.botaoContainer}>
            <BotaoPrimario titulo="Salvar gasto" onPress={validarESalvar} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: cores.texto,
    marginBottom: 20,
  },
  rotulo: {
    fontSize: 13,
    fontWeight: '600',
    color: cores.textoSecundario,
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    backgroundColor: cores.fundoCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: cores.texto,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  botaoContainer: {
    marginTop: 28,
  },
});
