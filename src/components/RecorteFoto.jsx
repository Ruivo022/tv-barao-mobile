import React, { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../theme/colors';

const FORMATOS = [
  { nome: '16:9', largura: 16, altura: 9 },
  { nome: '21:9', largura: 7, altura: 3 },
];
const CENTRO = { x: 0.5, y: 0.5 };

const limitar = (valor, minimo, maximo) => Math.min(maximo, Math.max(minimo, valor));

function dimensoesDoRecorte(imagem, formato, zoom) {
  const fator = Math.min(imagem.width / formato.largura, imagem.height / formato.altura) / zoom;
  const unidade = fator >= 1 ? Math.floor(fator) : fator;
  return {
    width: Math.max(1, Math.floor(formato.largura * unidade)),
    height: Math.max(1, Math.floor(formato.altura * unidade)),
  };
}

export default function RecorteFoto({ imagem, aoFechar, aoAplicar }) {
  const janela = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [formato, setFormato] = useState(FORMATOS[0]);
  const [zoom, setZoom] = useState(1);
  const [posicao, setPosicao] = useState(CENTRO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const posicaoAtual = useRef(CENTRO);
  const inicioDoGesto = useRef(CENTRO);
  const salvandoRef = useRef(false);

  const recorte = dimensoesDoRecorte(imagem, formato, zoom);
  const sobraX = imagem.width - recorte.width;
  const sobraY = imagem.height - recorte.height;
  const largura = Math.max(1, Math.min(560, janela.width - insets.left - insets.right - 40));
  const escala = largura / recorte.width;
  const origemX = Math.round(sobraX * posicao.x);
  const origemY = Math.round(sobraY * posicao.y);

  const gestos = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => !salvandoRef.current,
    onPanResponderGrant: () => { inicioDoGesto.current = posicaoAtual.current; },
    onPanResponderMove: (_evento, gesto) => {
      const inicio = inicioDoGesto.current;
      const posicaoNova = {
        x: sobraX ? limitar(inicio.x - gesto.dx / (sobraX * escala), 0, 1) : inicio.x,
        y: sobraY ? limitar(inicio.y - gesto.dy / (sobraY * escala), 0, 1) : inicio.y,
      };
      posicaoAtual.current = posicaoNova;
      setPosicao(posicaoNova);
    },
  }), [escala, sobraX, sobraY]);

  async function aplicarRecorte() {
    if (salvandoRef.current) return;

    salvandoRef.current = true;
    setSalvando(true);
    setErro('');
    try {
      const contexto = ImageManipulator.manipulate(imagem.uri);
      contexto.crop({ originX: origemX, originY: origemY, ...recorte });
      const resultado = await contexto.renderAsync();
      const foto = await resultado.saveAsync({ format: SaveFormat.JPEG, compress: 0.9 });
      aoAplicar(foto);
    } catch {
      setErro('Não foi possível recortar esta foto. Tente novamente ou use a original.');
    } finally {
      salvandoRef.current = false;
      setSalvando(false);
    }
  }

  return (
    <Modal animationType="slide" onRequestClose={() => { if (!salvandoRef.current) aoFechar(); }}>
      <ScrollView
        style={styles.tela}
        contentContainerStyle={[
          styles.conteudo,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24, paddingLeft: insets.left + 20, paddingRight: insets.right + 20 },
        ]}
      >
        <View style={{ width: largura }}>
          <Text style={styles.titulo} accessibilityRole="header">Recortar foto</Text>
          <Text style={styles.instrucao}>Escolha o formato e arraste a foto para enquadrar o que deve aparecer na TV.</Text>

          <View style={styles.opcoes} accessibilityRole="radiogroup" accessibilityLabel="Proporção do recorte">
            {FORMATOS.map((opcao) => (
              <Pressable
                key={opcao.nome}
                style={[styles.opcao, formato === opcao && styles.selecionada]}
                onPress={() => setFormato(opcao)}
                disabled={salvando}
                accessibilityRole="radio"
                accessibilityState={{ checked: formato === opcao, disabled: salvando }}
              >
                <Text style={styles.textoBotao}>{opcao.nome}</Text>
              </Pressable>
            ))}
          </View>

          <View
            style={[styles.quadro, Platform.OS === 'web' && styles.quadroWeb, { width: largura, height: recorte.height * escala }]}
            {...gestos.panHandlers}
          >
            <Image
              source={{ uri: imagem.uri }}
              accessibilityLabel="Prévia do recorte"
              contentFit="contain"
              style={{
                position: 'absolute',
                width: imagem.width * escala,
                height: imagem.height * escala,
                left: -origemX * escala,
                top: -origemY * escala,
              }}
            />
            <View pointerEvents="none" style={styles.margemDoQuadro} />
          </View>

          <View style={styles.zoom}>
            <Pressable
              style={styles.opcao}
              accessibilityRole="button"
              accessibilityLabel="Diminuir zoom"
              disabled={salvando || zoom <= 1}
              onPress={() => setZoom((valor) => Math.max(1, valor - 0.25))}
            >
              <Text style={styles.textoBotao}>−</Text>
            </Pressable>
            <Text style={styles.instrucao}>Zoom {Math.round(zoom * 100)}%</Text>
            <Pressable
              style={styles.opcao}
              accessibilityRole="button"
              accessibilityLabel="Aumentar zoom"
              disabled={salvando || zoom >= 3}
              onPress={() => setZoom((valor) => Math.min(3, valor + 0.25))}
            >
              <Text style={styles.textoBotao}>+</Text>
            </Pressable>
          </View>

          {!!erro && <Text style={styles.erro} accessibilityRole="alert">{erro}</Text>}
          <Pressable style={styles.aplicar} onPress={aplicarRecorte} disabled={salvando} accessibilityRole="button">
            {salvando ? <ActivityIndicator color={colors.background} /> : (
              <Text style={styles.textoAplicar}>Usar recorte</Text>
            )}
          </Pressable>
          <Pressable style={styles.secundario} onPress={() => aoAplicar(imagem)} disabled={salvando} accessibilityRole="button">
            <Text style={styles.textoBotao}>Usar foto original</Text>
          </Pressable>
          <Pressable style={styles.secundario} onPress={aoFechar} disabled={salvando} accessibilityRole="button">
            <Text style={styles.instrucao}>Fechar recorte</Text>
          </Pressable>
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  conteudo: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  titulo: { color: colors.text, fontSize: 24, fontWeight: '800', marginBottom: 8 },
  instrucao: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  opcoes: { flexDirection: 'row', gap: 10, marginVertical: 16 },
  opcao: {
    minHeight: 44, minWidth: 48, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 14, borderRadius: 8, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  selecionada: { borderColor: colors.primary, backgroundColor: colors.surfaceLight },
  quadro: { overflow: 'hidden', backgroundColor: colors.surface },
  quadroWeb: { touchAction: 'none' },
  margemDoQuadro: { ...StyleSheet.absoluteFillObject, borderWidth: 1, borderColor: colors.primary },
  zoom: { flexDirection: 'row', gap: 16, alignItems: 'center', justifyContent: 'center', marginVertical: 16 },
  erro: { color: '#FF7185', marginBottom: 12 },
  aplicar: { minHeight: 48, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  textoAplicar: { color: colors.background, fontWeight: '800' },
  secundario: { minHeight: 44, alignItems: 'center', justifyContent: 'center', marginTop: 6 },
  textoBotao: { color: colors.text, fontWeight: '700' },
});
