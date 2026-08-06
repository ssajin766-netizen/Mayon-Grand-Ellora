// src/navigation/types.ts
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export type ResidentsStackParamList = {
  ResidentList: undefined;
  ResidentDetail: { residentId: string };
  ResidentForm: { mode: 'create' | 'edit'; residentId?: string };
};

export type ResidentsStackNavigationProp<T extends keyof ResidentsStackParamList> =
  NativeStackNavigationProp<ResidentsStackParamList, T>;
