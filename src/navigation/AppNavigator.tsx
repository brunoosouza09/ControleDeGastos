import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { NovoGastoScreen } from '../screens/NovoGastoScreen';
import { ResumoScreen } from '../screens/ResumoScreen';
import { DetalheGastoScreen } from '../screens/DetalheGastoScreen';
import { cores } from '../constants/cores';
import { AbasParamList, PilhaParamList } from './tipos';

const Abas = createBottomTabNavigator<AbasParamList>();
const Pilha = createNativeStackNavigator<PilhaParamList>();

// Aplica a paleta do app ao fundo e às bordas que o React Navigation desenha
const tema = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: cores.primaria,
    background: cores.fundo,
    card: cores.fundoCard,
    text: cores.texto,
    border: cores.borda,
  },
};

function iconeDaAba(emoji: string) {
  return () => <Text style={styles.icone}>{emoji}</Text>;
}

/** Abas inferiores: Início, Novo gasto e Resumo */
function NavegacaoPorAbas() {
  return (
    <Abas.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarLabelStyle: styles.rotuloAba,
      }}
    >
      <Abas.Screen
        name="Inicio"
        component={HomeScreen}
        options={{ title: 'Início', tabBarIcon: iconeDaAba('🏠') }}
      />
      <Abas.Screen
        name="NovoGasto"
        component={NovoGastoScreen}
        options={{ title: 'Novo', tabBarIcon: iconeDaAba('➕') }}
      />
      <Abas.Screen
        name="Resumo"
        component={ResumoScreen}
        options={{ title: 'Resumo', tabBarIcon: iconeDaAba('📊') }}
      />
    </Abas.Navigator>
  );
}

/** Raiz da navegação: as abas e, por cima delas, a tela de detalhe do gasto */
export function AppNavigator() {
  return (
    <NavigationContainer theme={tema}>
      <Pilha.Navigator>
        <Pilha.Screen name="Abas" component={NavegacaoPorAbas} options={{ headerShown: false }} />
        <Pilha.Screen
          name="DetalheGasto"
          component={DetalheGastoScreen}
          options={{ title: 'Detalhe do gasto', headerTintColor: cores.primaria }}
        />
      </Pilha.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  icone: {
    fontSize: 18,
  },
  rotuloAba: {
    fontSize: 12,
    fontWeight: '600',
  },
});
