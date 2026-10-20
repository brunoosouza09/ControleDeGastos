import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GastosProvider } from './src/context/GastosContext';
import { AppNavigator } from './src/navigation/AppNavigator';

export default function App() {
  // Os gastos (vindos da Web API) ficam no GastosProvider e são lidos por todas as telas
  return (
    <GastosProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </GastosProvider>
  );
}
