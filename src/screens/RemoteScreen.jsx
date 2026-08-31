import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  Pause,
  Play,
  SkipForward,
  SkipBack,
  Pin,
} from 'lucide-react-native';

import { enviarComandoTV } from '../services/remoteControl';
import colors from '../theme/colors';

export default function RemoteScreen() {

  async function executarComando(acao) {
    try {
      await enviarComandoTV(acao);
    } catch (error) {
      console.error('Erro ao enviar comando:', error);

      Alert.alert(
        'Erro',
        'Não foi possível enviar o comando para a TV.'
      );
    }
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        CONTROLE DA TV
      </Text>

      <Text style={styles.subtitle}>
        TV BARÃO
      </Text>

      <View style={styles.statusContainer}>
        <View style={styles.statusDot} />

        <Text style={styles.statusText}>
          CONTROLE REMOTO
        </Text>
      </View>

      <View style={styles.controls}>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => executarComando('ANTERIOR')}
          activeOpacity={0.7}
        >
          <SkipBack
            size={38}
            color={colors.primary}
          />

          <Text style={styles.buttonText}>
            ANTERIOR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => executarComando('PAUSAR')}
          activeOpacity={0.7}
        >
          <Pause
            size={38}
            color={colors.warning}
          />

          <Text style={styles.buttonText}>
            PAUSAR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => executarComando('RETOMAR')}
          activeOpacity={0.7}
        >
          <Play
            size={38}
            color={colors.success}
          />

          <Text style={styles.buttonText}>
            RETOMAR
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => executarComando('PROXIMO')}
          activeOpacity={0.7}
        >
          <SkipForward
            size={38}
            color={colors.primary}
          />

          <Text style={styles.buttonText}>
            PRÓXIMO
          </Text>
        </TouchableOpacity>

      </View>

      <TouchableOpacity
        style={styles.fixButton}
        onPress={() => executarComando('FIXAR')}
        activeOpacity={0.8}
      >
        <Pin
          size={24}
          color="#FFFFFF"
        />

        <Text style={styles.fixText}>
          FIXAR SLIDE
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
    textAlign: 'center',
  },

  subtitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 3,
    marginTop: 6,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 35,
  },

  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 10,
    backgroundColor: colors.success,
    marginRight: 8,
  },

  statusText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },

  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },

  controlButton: {
    width: '48%',
    height: 125,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 12,
  },

  fixButton: {
    height: 60,
    backgroundColor: colors.secondary,
    borderRadius: 16,
    marginTop: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  fixText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});