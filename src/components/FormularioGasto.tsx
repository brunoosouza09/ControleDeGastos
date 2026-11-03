import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Categoria, GastoInput } from '../types/Gasto';
import { CATEGORIAS } from '../constants/categorias';
import { cores } from '../constants/cores';
import { CategoriaChip } from './CategoriaChip';
import { BotaoPrimario } from './BotaoPrimario';

interface FormularioGastoProps {
  titulo?: string;
  textoBotao: string;
  /** Valores iniciais (na edição, os dados atuais do gasto) */
  inicial?: GastoInput;
  /** Grava os dados; devolve true se deu certo (o formulário então é limpo, se pedido) */
  onSalvar: (dados: GastoInput) => Promise<boolean>;
  /** Mensagem de erro vinda do servidor, exibida acima do botão */
  erroDoServidor?: string | null;
  limparAoSalvar?: boolean;
}

type ErrosDeCampo = Partial<Record<'titulo' | 'valor' | 'categoria', string>>;

/** Converte "1.234,56", "49,90" ou "49.9" em número; NaN se o texto não for um valor válido */
export function lerValor(texto: string): number {
  const limpo = texto.trim().replace(/\s/g, '');
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  return /^\d+(\.\d{1,2})?$/.test(normalizado) ? Number(normalizado) : NaN;
}

function valorParaTexto(valor?: number): string {
  return valor === undefined ? '' : valor.toFixed(2).replace('.', ',');
}

/** Formulário de gasto reutilizado no cadastro e na edição, com validação por campo */
export function FormularioGasto({
  titulo,
  textoBotao,
  inicial,
  onSalvar,
  erroDoServidor,
  limparAoSalvar = false,
}: FormularioGastoProps) {
  const [tituloGasto, setTituloGasto] = useState(inicial?.titulo ?? '');
  const [valorTexto, setValorTexto] = useState(valorParaTexto(inicial?.valor));
  const [categoria, setCategoria] = useState<Categoria | null>(inicial?.categoria ?? null);
  const [erros, setErros] = useState<ErrosDeCampo>({});
  const [salvando, setSalvando] = useState(false);

  function validar(): GastoInput | null {
    const novosErros: ErrosDeCampo = {};
    const tituloLimpo = tituloGasto.trim();
    const valor = lerValor(valorTexto);

    if (!tituloLimpo) novosErros.titulo = 'Informe um título para o gasto.';

    if (!valorTexto.trim()) novosErros.valor = 'Informe o valor do gasto.';
    else if (Number.isNaN(valor)) novosErros.valor = 'Use apenas números, com até 2 casas decimais (ex.: 49,90).';
    else if (valor <= 0) novosErros.valor = 'O valor deve ser maior que zero.';
    else if (valor >= 1_000_000) novosErros.valor = 'O valor deve ser menor que R$ 1.000.000,00.';

    if (!categoria) novosErros.categoria = 'Selecione uma categoria.';

    setErros(novosErros);
    if (Object.keys(novosErros).length > 0 || !categoria) return null;
    return { titulo: tituloLimpo, valor, categoria };
  }

  async function aoSalvar() {
    const dados = validar();
    if (!dados) return;
    setSalvando(true);
    const deuCerto = await onSalvar(dados);
    setSalvando(false);
    if (deuCerto && limparAoSalvar) {
      setTituloGasto('');
      setValorTexto('');
      setCategoria(null);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        {titulo ? <Text style={styles.titulo}>{titulo}</Text> : null}

        <Text style={styles.rotulo}>Título</Text>
        <TextInput
          style={[styles.input, erros.titulo ? styles.inputComErro : null]}
          placeholder="Ex.: Almoço, Uber, Aluguel..."
          placeholderTextColor={cores.textoSecundario}
          value={tituloGasto}
          onChangeText={(texto) => {
            setTituloGasto(texto);
            setErros((e) => ({ ...e, titulo: undefined }));
          }}
          maxLength={80}
          editable={!salvando}
        />
        {erros.titulo ? <Text style={styles.erroCampo}>{erros.titulo}</Text> : null}

        <Text style={styles.rotulo}>Valor (R$)</Text>
        <TextInput
          style={[styles.input, erros.valor ? styles.inputComErro : null]}
          placeholder="Ex.: 49,90"
          placeholderTextColor={cores.textoSecundario}
          value={valorTexto}
          onChangeText={(texto) => {
            setValorTexto(texto);
            setErros((e) => ({ ...e, valor: undefined }));
          }}
          keyboardType="decimal-pad"
          editable={!salvando}
        />
        {erros.valor ? <Text style={styles.erroCampo}>{erros.valor}</Text> : null}

        <Text style={styles.rotulo}>Categoria</Text>
        <View style={styles.chips}>
          {CATEGORIAS.map((item) => (
            <CategoriaChip
              key={item}
              nome={item}
              selecionado={categoria === item}
              onPress={() => {
                setCategoria(item);
                setErros((e) => ({ ...e, categoria: undefined }));
              }}
            />
          ))}
        </View>
        {erros.categoria ? <Text style={styles.erroCampo}>{erros.categoria}</Text> : null}

        {erroDoServidor ? (
          <View style={styles.caixaErro}>
            <Text style={styles.caixaErroTexto}>{erroDoServidor}</Text>
          </View>
        ) : null}

        <View style={styles.botaoContainer}>
          <BotaoPrimario titulo={textoBotao} onPress={aoSalvar} carregando={salvando} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  conteudo: { padding: 20 },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: cores.texto,
    marginBottom: 6,
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
  inputComErro: { borderColor: cores.perigo },
  erroCampo: {
    color: cores.perigo,
    fontSize: 12,
    marginTop: 4,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  caixaErro: {
    marginTop: 20,
    padding: 12,
    borderRadius: 10,
    backgroundColor: cores.perigoFundo,
    borderWidth: 1,
    borderColor: cores.perigo,
  },
  caixaErroTexto: { color: cores.perigo, fontSize: 13, fontWeight: '600' },
  botaoContainer: { marginTop: 28 },
});
