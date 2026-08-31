import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import colors from '../theme/colors';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleLogin() {
    // Temporariamente entra no aplicativo.
    // Depois vamos substituir pelo Supabase Auth.
    navigation.replace('Main');
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>

        <View style={styles.logoContainer}>
          <Text style={styles.logo}>TV</Text>
          <Text style={styles.logoAccent}>BARÃO</Text>
        </View>

        <Text style={styles.title}>
          Controle do Mural
        </Text>

        <Text style={styles.subtitle}>
          Acesso institucional
        </Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail institucional"
          placeholderTextColor={colors.textMuted}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Senha"
          placeholderTextColor={colors.textMuted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            ENTRAR
          </Text>
        </TouchableOpacity>

      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
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

  buttonText: {
    color: '#001014',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});