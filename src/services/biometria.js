import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

const CHAVE = '@tv-barao/biometria';

export async function lerBiometria() {
  if (Platform.OS === 'web') return { nome: null, usuarioId: null };

  const [nivel, tipos, usuarioId] = await Promise.all([
    LocalAuthentication.getEnrolledLevelAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
    AsyncStorage.getItem(CHAVE),
  ]);

  if (nivel !== LocalAuthentication.SecurityLevel.BIOMETRIC_STRONG) {
    return { nome: null, usuarioId };
  }

  const faceId = Platform.OS === 'ios' &&
    tipos.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION);
  return { nome: faceId ? 'Face ID' : 'Biometria', usuarioId };
}

export function salvarBiometria(usuarioId) {
  return usuarioId ? AsyncStorage.setItem(CHAVE, usuarioId) : AsyncStorage.removeItem(CHAVE);
}

export async function confirmarBiometria(mensagem) {
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: mensagem,
    cancelLabel: 'Cancelar',
    disableDeviceFallback: true,
    biometricsSecurityLevel: 'strong',
  });

  if (resultado.success) return true;
  if (['user_cancel', 'app_cancel', 'system_cancel'].includes(resultado.error)) return false;
  throw new Error('Não foi possível confirmar a biometria. Confira o cadastro biométrico do aparelho ou use a senha.');
}
