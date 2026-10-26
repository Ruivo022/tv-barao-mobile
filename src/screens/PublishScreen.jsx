
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import colors from '../theme/colors';

export default function Screen() {
  const [imagem, setImagem] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [publicando, setPublicando] = useState(false);

  async function tirarFoto() {
    const permissao =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso à câmera para tirar uma foto.'
      );
      return;
    }

    const resultado = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!resultado.canceled) {
      setImagem(resultado.assets[0]);
    }
  }

  async function escolherGaleria() {
    const permissao =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso à galeria para escolher uma foto.'
      );
      return;
    }

    const resultado =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

    if (!resultado.canceled) {
      setImagem(resultado.assets[0]);
    }
  }

  async function publicar() {
    if (!imagem) {
      Alert.alert(
        'Escolha uma imagem',
        'Tire uma foto ou selecione uma imagem da galeria.'
      );
      return;
    }

    if (!titulo.trim()) {
      Alert.alert(
        'Informe o título',
        'Digite um título para a publicação.'
      );
      return;
    }

    setPublicando(true);

    try {
      // Aqui será feita a integração com o Supabase
      // para enviar a imagem e salvar a publicação.

      Alert.alert(
        'Imagem selecionada!',
        'A tela está pronta. Conecte o envio ao Supabase para publicar na TV.',
      );
    } catch (erro) {
      Alert.alert(
        'Erro',
        'Não foi possível publicar a imagem.'
      );
    } finally {
      setPublicando(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.eyebrow}>TV BARÃO DE JUNDIAÍ</Text>

      <Text style={styles.heading}>PUBLICAR</Text>

      <Text style={styles.subtitle}>
        Compartilhe fotos e avisos na TV da escola.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>
          NOVA PUBLICAÇÃO
        </Text>

        <Text style={styles.label}>Imagem da publicação</Text>

        {imagem ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: imagem.uri }}
              style={styles.preview}
              resizeMode="contain"
            />

            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => setImagem(null)}
            >
              <Text style={styles.removeText}>
                Remover imagem
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadArea}>
            <Text style={styles.cameraIcon}>▧</Text>

            <Text style={styles.uploadTitle}>
              Adicione uma foto
            </Text>

            <Text style={styles.uploadHint}>
              Tire uma foto ou escolha um arquivo do celular.
            </Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={tirarFoto}
          activeOpacity={0.8}
        >
          <Text style={styles.cameraButtonText}>
            ◎  Tirar foto agora
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.galleryButton}
          onPress={escolherGaleria}
          activeOpacity={0.8}
        >
          <Text style={styles.galleryButtonText}>
            ▧  Escolher da galeria
          </Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <Text style={styles.label}>Título</Text>

        <TextInput
          style={styles.input}
          placeholder="Ex.: Feira de Ciências"
          placeholderTextColor={colors.textSecondary}
          value={titulo}
          onChangeText={setTitulo}
          maxLength={100}
        />

        <Text style={styles.label}>Descrição (opcional)</Text>

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Escreva uma mensagem para aparecer na TV..."
          placeholderTextColor={colors.textSecondary}
          value={descricao}
          onChangeText={setDescricao}
          multiline
          maxLength={500}
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[
            styles.publishButton,
            publicando && styles.disabledButton,
          ]}
          onPress={publicar}
          disabled={publicando}
          activeOpacity={0.8}
        >
          {publicando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.publishText}>
              ↑  PUBLICAR NA TV
            </Text>
          )}
        </TouchableOpacity>

        <Text style={styles.footerNote}>
          Revise a imagem e o título antes de publicar.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  eyebrow: {
    color: '#00D9F5',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 8,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#0D1424',
    borderColor: '#1B2639',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
  },
  sectionTitle: {
    color: '#00D9F5',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 22,
  },
  label: {
    color: '#DCE5F4',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    marginTop: 18,
  },
  uploadArea: {
    minHeight: 180,
    borderWidth: 1,
    borderColor: '#34415A',
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#080D19',
  },
  cameraIcon: {
    color: '#00D9F5',
    fontSize: 40,
    marginBottom: 10,
  },
  uploadTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  uploadHint: {
    color: '#8795AD',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  previewContainer: {
    backgroundColor: '#080D19',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: 260,
    borderRadius: 8,
  },
  removeButton: {
    padding: 12,
  },
  removeText: {
    color: '#FF7185',
    fontSize: 12,
    fontWeight: '700',
  },
  cameraButton: {
    backgroundColor: '#00D9F5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  cameraButtonText: {
    color: '#07111D',
    fontWeight: '900',
    fontSize: 14,
  },
  galleryButton: {
    backgroundColor: '#172238',
    borderWidth: 1,
    borderColor: '#34415A',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  galleryButtonText: {
    color: '#E1EAF8',
    fontWeight: '800',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#263249',
    marginTop: 24,
  },
  input: {
    backgroundColor: '#080D19',
    borderWidth: 1,
    borderColor: '#29364D',
    borderRadius: 10,
    color: '#FFFFFF',
    padding: 14,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  publishButton: {
    backgroundColor: '#482485',
    borderRadius: 10,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  publishText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  },
  footerNote: {
    color: '#8493AD',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 17,
  },
});
