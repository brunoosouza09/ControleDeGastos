import { Platform } from 'react-native';

// Endereço da Web API. Num celular físico, copie .env.example para .env.local e
// informe o IP do computador que roda a API. Os padrões abaixo servem para o
// emulador Android (10.0.2.2 é o computador visto de dentro dele) e para o navegador.
const URL_PADRAO = Platform.OS === 'android' ? 'http://10.0.2.2:3333' : 'http://localhost:3333';

export const URL_BASE_API = (process.env.EXPO_PUBLIC_API_URL || URL_PADRAO).replace(/\/+$/, '');
