import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GastoCard } from '../components/GastoCard';
import { ResumoCard } from '../components/ResumoCard';
import { BotaoPrimario } from '../components/BotaoPrimario';
import { EstadoDaConsulta } from '../components/EstadoDaConsulta';
import { useGastosContext } from '../context/GastosContext';
import { InicioScreenProps } from '../navigation/tipos';
import { cores } from '../constants/cores';
import { formatarMoeda } from '../utils/formatarMoeda';

/** Tela inicial: total do mês, atalho para novo gasto e lista de gastos vindos da API */
export function HomeScreen({ navigation }: InicioScreenProps) {
  const { gastos, status, erro, recarregar } = useGastosContext();
  const hoje = new Date();

  const gastosDoMes = gastos.filter(
    (gasto) =>
      gasto.data.getMonth() === hoje.getMonth() &&
      gasto.data.getFullYear() === hoje.getFullYear()
  );
  const totalDoMes = gastosDoMes.reduce((soma, gasto) => soma + gasto.valor, 0);

  const gastosOrdenados = [...gastos].sort((a, b) => b.data.getTime() - a.data.getTime());

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <EstadoDaConsulta
        status={status}
        erro={erro}
        vazio={gastos.length === 0}
        mensagemVazio='Nenhum gasto registrado ainda. Toque em "Novo" para começar!'
        onTentarNovamente={recarregar}
      >
        <ResumoCard rotulo="Total gasto no mês" valor={formatarMoeda(totalDoMes)} />

        <View style={styles.botaoContainer}>
          <BotaoPrimario titulo="+ Novo gasto" onPress={() => navigation.navigate('NovoGasto')} />
        </View>

        <Text style={styles.subtitulo}>Seus gastos</Text>

        <FlatList
          style={styles.flatList}
          data={gastosOrdenados}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('DetalheGasto', { gastoId: item.id })}>
              <GastoCard
                titulo={item.titulo}
                valor={item.valor}
                categoria={item.categoria}
                data={item.data}
              />
            </Pressable>
          )}
          contentContainerStyle={styles.listaConteudo}
          showsVerticalScrollIndicator={false}
        />
      </EstadoDaConsulta>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: cores.fundo,
    padding: 20,
  },
  botaoContainer: {
    marginTop: 16,
    marginBottom: 20,
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: cores.texto,
    marginBottom: 12,
  },
  flatList: {
    flex: 1,
  },
  listaConteudo: {
    paddingBottom: 20,
  },
});
