import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/** Telas das abas inferiores (nenhuma recebe parâmetros) */
export type AbasParamList = {
  Inicio: undefined;
  NovoGasto: undefined;
  Resumo: undefined;
};

/** Telas da pilha principal: as abas, o detalhe e a edição (ambos recebem o id do gasto) */
export type PilhaParamList = {
  Abas: NavigatorScreenParams<AbasParamList>;
  DetalheGasto: { gastoId: string };
  EditarGasto: { gastoId: string };
};

export type InicioScreenProps = CompositeScreenProps<
  BottomTabScreenProps<AbasParamList, 'Inicio'>,
  NativeStackScreenProps<PilhaParamList>
>;
export type NovoGastoScreenProps = BottomTabScreenProps<AbasParamList, 'NovoGasto'>;
export type DetalheGastoScreenProps = NativeStackScreenProps<PilhaParamList, 'DetalheGasto'>;
export type EditarGastoScreenProps = NativeStackScreenProps<PilhaParamList, 'EditarGasto'>;
