import React, { useRef, useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import colors from '../theme/colors';

export default function LoginScreen({ aoEntrar, aoDesbloquear, nomeBiometria, ofertaBiometria, aoConcluirOferta }) {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [entrando, setEntrando] = useState(false);
  const loginEmAndamento = useRef(false);

  async function autenticar(acao) {
    if (loginEmAndamento.current) return;

    loginEmAndamento.current = true;
    setEntrando(true);
    setErro('');
    try {
      await acao();
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível entrar. Tente novamente.');
    } finally {
      loginEmAndamento.current = false;
      setEntrando(false);
    }
  }

  function handleLogin() {
    const emailLimpo = email.trim().toLowerCase();
    if (!emailLimpo || !password) {
      setErro('Preencha o e-mail e a senha.');
      return;
    }
    void autenticar(async () => {
      await aoEntrar(emailLimpo, password);
      setPassword('');
      Keyboard.dismiss();
    });
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, {
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>TV</Text>
          <Text style={styles.logoAccent}>BARÃO</Text>
        </View>

        {ofertaBiometria ? (
          <>
            <Text style={styles.title} accessibilityRole="header">Ativar {ofertaBiometria}?</Text>
            <Text style={styles.subtitle}>Use o desbloqueio do aparelho na próxima vez que abrir o app.</Text>
            {!!erro && <Text style={styles.error} accessibilityRole="alert">{erro}</Text>}
            <TouchableOpacity
              style={styles.button}
              onPress={() => autenticar(() => aoConcluirOferta(true))}
              disabled={entrando}
              accessibilityRole="button"
            >
              {entrando ? <ActivityIndicator color="#001014" /> : (
                <Text style={styles.buttonText}>Ativar {ofertaBiometria}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={() => autenticar(() => aoConcluirOferta(false))}
              disabled={entrando}
              accessibilityRole="button"
            >
              <Text style={styles.biometricText}>Agora não</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>Mural Digital</Text>

            <Text style={styles.subtitle}>
              Entre com sua conta institucional para acessar a TV Barão.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="E-mail institucional"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!entrando}
            />

            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor={colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              editable={!entrando}
              onSubmitEditing={handleLogin}
            />

            {!!erro && <Text style={styles.error} accessibilityRole="alert">{erro}</Text>}

            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={entrando}
              activeOpacity={0.8}
            >
              {entrando ? <ActivityIndicator color="#001014" /> : (
                <Text style={styles.buttonText}>ENTRAR</Text>
              )}
            </TouchableOpacity>

            {!!nomeBiometria && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={() => autenticar(aoDesbloquear)}
                disabled={entrando}
                accessibilityRole="button"
              >
                <Text style={styles.biometricText}>Desbloquear com {nomeBiometria}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 24,
  },

  logoContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },

  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: 4,
  },

  logoAccent: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 8,
    marginTop: -5,
  },

  title: {
    fontSize: 27,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },

  input: {
    height: 55,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 15,
    marginBottom: 14,
  },

  button: {
    height: 55,
    backgroundColor: colors.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  error: {
    color: '#FF7185',
    marginBottom: 12,
  },
  biometricButton: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 12,
    paddingHorizontal: 12,
  },
  biometricText: {
    color: colors.primary,
    fontWeight: '700',
    textAlign: 'center',
  },

  buttonText: {
    color: '#001014',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
