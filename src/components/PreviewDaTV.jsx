import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import colors from '../theme/colors';

const logo = require('../../assets/logo-branca.png');

function VideoDaTV({ link }) {
  const player = useVideoPlayer(link, (instancia) => {
    instancia.loop = true;
    instancia.muted = true;
    instancia.play();
  });

  return (
    <VideoView
      player={player}
      style={StyleSheet.absoluteFillObject}
      nativeControls={false}
      contentFit="contain"
    />
  );
}

function BrilhoDoCartao() {
  return (
    <Svg style={StyleSheet.absoluteFillObject} width="100%" height="100%" accessible={false}>
      <Defs>
        <LinearGradient id="brilho" x1="5%" y1="30%" x2="100%" y2="90%">
          <Stop offset="42%" stopColor="#111a36" />
          <Stop offset="100%" stopColor="#0c4a62" />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#brilho)" />
    </Svg>
  );
}

export default function PreviewDaTV({ aviso, textoLetreiro, rascunho = false, tvConectada = false }) {
  const [largura, setLargura] = useState(320);
  const [imagemComFalha, setImagemComFalha] = useState(null);
  const link = aviso?.link_fundo || null;
  const categoria = aviso?.categoria || 'Layout 2';
  const editorial = /\b(?:Layout 3|Modelo 2)\b/i.test(categoria);
  const somenteImagem = /\b(?:Layout 4|Modelo 3)\b/i.test(categoria);
  const imagemAEsquerda = /\bLayout 5\b/i.test(categoria);
  const dividido = /\b(?:Layout 2|Modelo 1|Layout 5)\b/i.test(categoria);
  const video = Boolean(!rascunho && link && (/\.(mp4|webm|ogg|mov|m3u8)(\?.*)?$/i.test(link) || link.includes('video')));
  const imagemIndisponivel = link && imagemComFalha === link;
  const somenteTexto = editorial || (!somenteImagem && !rascunho && !link);
  const escala = largura / 1440;
  const titulo = aviso?.titulo || (rascunho ? 'Título do aviso' : '');

  const foto = (
    <View style={styles.midias}>
      {video ? (
        <VideoDaTV key={link} link={link} />
      ) : link && !imagemIndisponivel ? (
        <Image
          source={{ uri: link }}
          style={styles.foto}
          contentFit="contain"
          accessibilityLabel="Foto do aviso"
          onLoad={() => setImagemComFalha(null)}
          onError={() => setImagemComFalha(link)}
        />
      ) : (
        <Text style={styles.semImagem}>
          {imagemIndisponivel ? 'Imagem indisponível' : rascunho ? 'Adicione uma foto' : 'Aviso sem mídia'}
        </Text>
      )}
    </View>
  );

  const larguraCartao = somenteTexto ? styles.cartaoEditorial : styles.cartaoDividido;
  const texto = (
    <View style={[
      styles.cartao,
      larguraCartao,
      { paddingHorizontal: Math.max(6, 32 * escala), paddingVertical: Math.max(6, 41 * escala) },
    ]}>
      <BrilhoDoCartao />
      {!!titulo && (
        <Text
          numberOfLines={2}
          style={[
            styles.titulo,
            somenteTexto && styles.tituloEditorial,
            { fontSize: Math.max(11, (somenteTexto ? 42 : 34) * escala) },
          ]}
        >
          {titulo}
        </Text>
      )}
      {!somenteTexto && <View style={styles.traco} />}
      {!!aviso?.descricao && (
        <Text
          numberOfLines={4}
          style={[
            styles.descricao,
            {
              fontSize: Math.max(8, 23 * escala),
              marginTop: somenteTexto ? Math.max(4, 18 * escala) : 0,
            },
          ]}
        >
          {aviso.descricao}
        </Text>
      )}
      {!somenteTexto && !!aviso?.horario && (
        <Text numberOfLines={1} style={styles.horario}>{aviso.horario}</Text>
      )}
    </View>
  );

  return (
    <View style={styles.moldura} onLayout={(evento) => setLargura(evento.nativeEvent.layout.width)}>
      <View style={styles.cabecalho}>
        <Image source={logo} style={[styles.logo, { width: Math.max(10, 48 * escala) }]} contentFit="cover" />
        <Text style={[styles.escola, { fontSize: Math.max(7, 22 * escala) }]} numberOfLines={1}>
          PEI BARÃO DE JUNDIAÍ
        </Text>
        {tvConectada && (
          <Text style={[styles.online, { fontSize: Math.max(6, 11 * escala) }]}>● CONTROLE ONLINE</Text>
        )}
      </View>
      <View style={styles.areaDoAviso}>
        {somenteTexto ? texto : somenteImagem ? (
          <>
            {!!link && !video && !imagemIndisponivel && (
              <Image
                source={{ uri: link }}
                style={styles.fundoDesfocado}
                contentFit="cover"
                blurRadius={20}
                accessible={false}
              />
            )}
            <View style={styles.molduraDaFoto}>{foto}</View>
          </>
        ) : dividido ? (
          <View style={[styles.dividido, imagemAEsquerda && styles.imagemAEsquerda]}>
            {texto}
            {foto}
          </View>
        ) : (
          <>
            {foto}
            <View style={styles.textoSobreImagem}>{texto}</View>
          </>
        )}
      </View>
      <View style={styles.rodape}>
        {!rascunho && !!textoLetreiro && (
          <>
            <Text style={styles.rotuloLetreiro}>AVISO</Text>
            <Text numberOfLines={1} style={styles.letreiro}>
              {textoLetreiro}
            </Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  moldura: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#060b19',
  },
  cabecalho: {
    flex: 0.087,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '3%',
    gap: 4,
    backgroundColor: '#111a36',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#242e48',
  },
  logo: {
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: '#000',
  },
  escola: {
    flex: 1,
    color: '#fff',
    fontWeight: '800',
  },
  online: {
    color: '#00ff88',
    fontWeight: '800',
  },
  areaDoAviso: {
    flex: 0.843,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  dividido: {
    flexDirection: 'row',
    alignItems: 'stretch',
    width: '92%',
    height: '88%',
    gap: 6,
  },
  imagemAEsquerda: {
    flexDirection: 'row-reverse',
  },
  cartao: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#111a36',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2a3953',
    borderRadius: 8,
  },
  cartaoEditorial: {
    width: '61%',
    maxHeight: '94%',
  },
  cartaoDividido: {
    width: '48%',
  },
  titulo: {
    color: '#f8fafc',
    fontWeight: '800',
    textAlign: 'center',
  },
  tituloEditorial: {
    color: '#00d2ff',
    textTransform: 'uppercase',
  },
  descricao: {
    color: '#e2e8f0',
    textAlign: 'center',
  },
  traco: {
    width: '14%',
    height: StyleSheet.hairlineWidth,
    marginVertical: 4,
    backgroundColor: '#00d2ff',
  },
  horario: {
    color: '#00d2ff',
    marginTop: 4,
    fontSize: 8,
  },
  midias: {
    flex: 1,
    width: '100%',
    minWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  molduraDaFoto: {
    width: '96%',
    height: '98%',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#24758a',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: 'rgba(11, 26, 54, 0.25)',
  },
  fundoDesfocado: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.3,
  },
  semImagem: {
    color: colors.textSecondary,
    fontSize: 9,
    textAlign: 'center',
  },
  textoSobreImagem: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 8,
    alignItems: 'center',
  },
  rodape: {
    flex: 0.07,
    flexDirection: 'row',
    alignItems: 'stretch',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#00d2ff',
    backgroundColor: '#0f172a',
    overflow: 'hidden',
  },
  rotuloLetreiro: {
    paddingHorizontal: 5,
    color: '#0f172a',
    backgroundColor: '#00d2ff',
    fontSize: 7,
    fontWeight: '800',
    alignSelf: 'center',
  },
  letreiro: {
    flex: 1,
    paddingHorizontal: 5,
    alignSelf: 'center',
    color: colors.text,
    fontSize: 7,
  },
});
