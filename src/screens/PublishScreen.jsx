
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import PreviewDaTV from '../components/PreviewDaTV';
import RecorteFoto from '../components/RecorteFoto';
import { publicarAviso } from '../services/publishService';
import colors from '../theme/colors';

const MODELOS = [
  {
    categoria: 'Layout 2: Cyber Dashboard',
    nome: 'Modelo 1: Split Dashboard',
    detalhes: 'Imagem e texto lado a lado',
    usaImagem: true,
    usaTexto: true,
  },
  {
    categoria: 'Layout 3: Editorial Nobre',
    nome: 'Modelo 2: Apenas Texto / Editorial',
    detalhes: 'Título e descrição centralizados',
    usaImagem: false,
    usaTexto: true,
  },
  {
    categoria: 'Layout 4: Foto Puro',
    nome: 'Modelo 3: Mídia Pura em Tela Cheia',
    detalhes: 'Imagem em tela cheia, sem texto',
    usaImagem: true,
    usaTexto: false,
  },
];

function temDimensoes(imagem) {
  return Number.isFinite(imagem?.width) && imagem.width > 0 &&
    Number.isFinite(imagem?.height) && imagem.height > 0;
}

export default function PublishScreen({ usuarioId }) {
  const [modelo, setModelo] = useState(MODELOS[0]);
  const [foto, setFoto] = useState(null);
  const [recortando, setRecortando] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [publicando, setPublicando] = useState(false);
  const [retorno, setRetorno] = useState(null);
  const envioEmAndamento = useRef(false);
  const tentativa = useRef({});
  const { categoria, usaImagem, usaTexto } = modelo;
  const imagem = foto?.atual;

  function alterarImagem(novaImagem, original = novaImagem) {
    tentativa.current = {};
    setFoto(novaImagem ? { atual: novaImagem, original } : null);
    setRetorno(null);
  }

  function selecionarImagem(original) {
    alterarImagem(original);
    setRecortando(temDimensoes(original));
  }

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
      quality: 0.8,
    });

    if (!resultado.canceled) {
      selecionarImagem(resultado.assets[0]);
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
        quality: 0.8,
      });

    if (!resultado.canceled) {
      selecionarImagem(resultado.assets[0]);
    }
  }

  async function publicar() {
    if (envioEmAndamento.current || recortando) return;

    if (usaImagem && !imagem) {
      setRetorno({ erro: true, texto: 'Tire uma foto ou escolha uma imagem da galeria.' });
      return;
    }

    if (usaTexto && !titulo.trim()) {
      setRetorno({ erro: true, texto: 'Digite um título para a publicação.' });
      return;
    }

    if (!usaImagem && !descricao.trim()) {
      setRetorno({ erro: true, texto: 'Digite a descrição do aviso editorial.' });
      return;
    }

    envioEmAndamento.current = true;
    setPublicando(true);
    setRetorno(null);

    try {
      await publicarAviso({
        imagem: usaImagem ? imagem : null,
        titulo: usaTexto ? titulo.trim() : '',
        descricao: usaTexto ? descricao.trim() : '',
        categoria,
        usuarioId,
        tentativa: usaImagem ? tentativa.current : {},
      });
      alterarImagem(null);
      setTitulo('');
      setDescricao('');
      setRetorno({ texto: 'Aviso publicado. A TV vai incluir o aviso na rotação.' });
    } catch (erro) {
      setRetorno({
        erro: true,
        texto: erro instanceof Error ? erro.message : 'Confira a conexão e tente novamente.',
      });
    } finally {
      envioEmAndamento.current = false;
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

        <Text style={styles.label}>Prévia na TV</Text>
        <PreviewDaTV
          rascunho
          aviso={{
            categoria,
            link_fundo: usaImagem ? imagem?.uri : null,
            titulo: titulo.trim(),
            descricao: descricao.trim(),
          }}
        />

        {usaImagem && (
          <View>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={tirarFoto}
              disabled={publicando}
              activeOpacity={0.8}
            >
              <Text style={styles.cameraButtonText}>Tirar foto agora</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.galleryButton}
              onPress={escolherGaleria}
              disabled={publicando}
              activeOpacity={0.8}
            >
              <Text style={styles.galleryButtonText}>Escolher da galeria</Text>
            </TouchableOpacity>

            {imagem && (
              <View style={styles.imageActions}>
                {temDimensoes(foto.original) && (
                  <TouchableOpacity
                    style={styles.imageAction}
                    onPress={() => setRecortando(true)}
                    disabled={publicando}
                    accessibilityRole="button"
                  >
                    <Text style={styles.cropText}>Recortar foto</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.imageAction}
                  onPress={() => alterarImagem(null)}
                  disabled={publicando}
                  accessibilityRole="button"
                >
                  <Text style={styles.removeText}>Remover imagem</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <Text style={styles.label}>Modelo do layout</Text>
        <View accessibilityRole="radiogroup" accessibilityLabel="Modelo do layout" style={styles.modelOptions}>
          {MODELOS.map((opcao) => {
            const selecionado = opcao === modelo;
            return (
              <TouchableOpacity
                key={opcao.categoria}
                accessibilityRole="radio"
                accessibilityState={{ checked: selecionado, disabled: publicando }}
                disabled={publicando}
                onPress={() => {
                  setModelo(opcao);
                  setRetorno(null);
                }}
                style={[styles.modelOption, selecionado && styles.modelOptionSelected]}
              >
                <View style={[styles.radio, selecionado && styles.radioSelected]}>
                  {selecionado && <View style={styles.radioDot} />}
                </View>
                <View style={styles.modelCopy}>
                  <Text style={[styles.modelName, selecionado && styles.modelNameSelected]}>{opcao.nome}</Text>
                  <Text style={styles.modelDetails}>{opcao.detalhes}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {usaImagem && usaTexto && <View style={styles.divider} />}

        {usaTexto && (
          <View>
            <Text style={styles.label}>Título</Text>

            <TextInput
              style={styles.input}
              placeholder="Ex.: Feira de Ciências"
              placeholderTextColor={colors.textSecondary}
              value={titulo}
              onChangeText={setTitulo}
              editable={!publicando}
              maxLength={100}
            />

            <Text style={styles.label}>{usaImagem ? 'Descrição (opcional)' : 'Descrição'}</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Escreva uma mensagem para aparecer na TV..."
              placeholderTextColor={colors.textSecondary}
              value={descricao}
              onChangeText={setDescricao}
              editable={!publicando}
              multiline
              maxLength={500}
              textAlignVertical="top"
            />
          </View>
        )}

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

        {retorno && (
          <Text
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            style={[styles.feedback, retorno.erro && styles.feedbackError]}
          >
            {retorno.texto}
          </Text>
        )}

        <Text style={styles.footerNote}>
          Revise o conteúdo antes de publicar.
        </Text>
      </View>
      {recortando && foto && (
        <RecorteFoto
          imagem={foto.original}
          aoFechar={() => setRecortando(false)}
          aoAplicar={(recorte) => {
            alterarImagem(recorte, foto.original);
            setRecortando(false);
          }}
        />
      )}
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
  modelOptions: {
    gap: 8,
  },
  modelOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#080D19',
    borderWidth: 1,
    borderColor: '#29364D',
    borderRadius: 10,
    padding: 12,
  },
  modelOptionSelected: {
    borderColor: colors.primary,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  modelCopy: {
    flex: 1,
  },
  modelName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  modelNameSelected: {
    color: colors.primary,
  },
  modelDetails: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 3,
  },
  imageActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  imageAction: {
    padding: 12,
  },
  cropText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
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
  feedback: {
    color: colors.success,
    fontSize: 13,
    marginTop: 12,
    textAlign: 'center',
  },
  feedbackError: {
    color: '#FF7185',
  },
  footerNote: {
    color: '#8493AD',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 17,
  },
});
