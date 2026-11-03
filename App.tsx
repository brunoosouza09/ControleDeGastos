import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GastosProvider } from './src/context/GastosContext';
import { AvisoProvider } from './src/context/AvisoContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  // Os gastos (vindos da Web API) ficam no GastosProvider e são lidos por todas as telas;
  // o AvisoProvider mostra o feedback rápido das ações (cadastrado, salvo, excluído)
  return (
    <SafeAreaProvider>
      <GastosProvider>
        <AvisoProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </AvisoProvider>
      </GastosProvider>
    </SafeAreaProvider>
  );
}
