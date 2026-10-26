import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import {
  CirclePause,
  CirclePlay,
  Pin,
  SkipBack,
  SkipForward,
  Tv,
} from 'lucide-react-native';

import { conectarControleTV, enviarComandoTV } from '../services/remoteControl';
import colors from '../theme/colors';

function PreviewDaTV({ aviso, textoLetreiro }) {
  const link = aviso?.link_fundo || null;
  const categoria = aviso?.categoria || '';
  const [imagemComFalha, setImagemComFalha] = useState(null);
  const imagemIndisponivel = link && imagemComFalha === link;
  useEffect(() => setImagemComFalha(null), [link]);
  const video = Boolean(link && (/\.(mp4|webm|ogg|mov|m3u8)(\?.*)?$/i.test(link) || link.includes('video')));
  const player = useVideoPlayer(video ? link : null, (instancia) => {
    instancia.loop = true;
    instancia.muted = true;
  });
  useEffect(() => {
    if (video) player.play();
    else player.pause();
  }, [link, player, video]);

  const semImagem = categoria.includes('Layout 3') || !link;
  const somenteImagem = categoria.includes('Layout 4');
  const layoutDividido = categoria.includes('Layout 2') || categoria.includes('Layout 5');
  const imagem = (
    <View style={styles.previewMedia}>
      {video ? (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFillObject}
          nativeControls={false}
          contentFit="contain"
        />
      ) : link && !imagemIndisponivel ? (
        <Image
          source={{ uri: link }}
          style={styles.previewImage}
          contentFit="contain"
          transition={150}
          onError={(event) => {
            console.warn('Não foi possível carregar a imagem do aviso no dispositivo.', event?.error);
            setImagemComFalha(link);
          }}
        />
      ) : (
        <View style={styles.noMedia}>
          <Tv size={26} color={colors.textMuted} />
          <Text style={styles.noMediaText}>{imagemIndisponivel ? 'IMAGEM INDISPONÍVEL' : 'AVISO SEM MÍDIA'}</Text>
        </View>
      )}
    </View>
  );

  const texto = (
    <View style={[styles.previewText, semImagem && styles.previewTextOnly]}>
      <Text numberOfLines={2} style={styles.previewTitle}>
        {aviso?.titulo || 'MURAL DIGITAL'}
      </Text>
      {aviso?.descricao ? (
        <Text numberOfLines={2} style={styles.previewDescription}>
          {aviso.descricao}
        </Text>
      ) : null}
      {aviso?.horario ? <Text numberOfLines={1} style={styles.previewSchedule}>{aviso.horario}</Text> : null}
    </View>
  );

  return (
    <View style={styles.previewFrame}>
      <View style={[styles.previewContent, layoutDividido && styles.previewSplit]}>
        {semImagem ? (
          texto
        ) : layoutDividido ? (
          categoria.includes('Layout 5') ? <>{imagem}{texto}</> : <>{texto}{imagem}</>
        ) : (
          <>
            {imagem}
            {!somenteImagem ? <View style={styles.previewOverlay}>{texto}</View> : null}
          </>
        )}
      </View>
      <View style={styles.previewTicker}>
        <Text style={styles.tickerLabel}>AVISO</Text>
        <Text numberOfLines={1} style={styles.tickerText}>
          {textoLetreiro || 'Painel Informativo PEI Barão de Jundiaí'}
        </Text>
      </View>
    </View>
  );
}

export default function RemoteScreen() {
  const [estadoTV, setEstadoTV] = useState(null);
  const [previaBanco, setPreviaBanco] = useState(null);
  const [indiceAvisoBanco, setIndiceAvisoBanco] = useState(0);
  const [segundosRestantes, setSegundosRestantes] = useState(null);
  const [erroLeituraBanco, setErroLeituraBanco] = useState(null);
  const [statusCanal, setStatusCanal] = useState('CONNECTING');
  const [comandoEmAndamento, setComandoEmAndamento] = useState(false);
  const [mensagem, setMensagem] = useState('');
  const chavePreviaBancoRef = useRef(null);
  const chaveAvisosBancoRef = useRef(null);

  useEffect(() => conectarControleTV({
    aoMudarEstado: setEstadoTV,
    aoMudarConexao: setStatusCanal,
    aoMudarPreviaBanco: (previa) => {
      const chavePrevia = JSON.stringify(previa);
      const chaveAvisos = JSON.stringify(previa.avisos);
      if (chaveAvisosBancoRef.current !== chaveAvisos) {
        chaveAvisosBancoRef.current = chaveAvisos;
        setIndiceAvisoBanco(0);
      }
      if (chavePreviaBancoRef.current !== chavePrevia) {
        chavePreviaBancoRef.current = chavePrevia;
        setPreviaBanco(previa);
      }
      setErroLeituraBanco(null);
    },
    aoFalharLeituraBanco: setErroLeituraBanco,
  }), []);

  const tvConectada = statusCanal === 'SUBSCRIBED' && estadoTV?.papel === 'tv';
  const avisosBanco = previaBanco?.avisos || [];
  const avisoBancoAtual = avisosBanco[indiceAvisoBanco] || null;
  const avisoAtual = tvConectada ? estadoTV.aviso : avisoBancoAtual;
  const letreiroAtual = tvConectada ? estadoTV.letreiro : previaBanco?.letreiro;
  const estadoExibido = tvConectada
    ? estadoTV.pausada
      ? 'TV PAUSADA'
      : estadoTV.fixada
        ? 'AVISO FIXADO'
        : 'TV AO VIVO'
    : avisosBanco.length > 0
      ? 'PRÉVIA DO SUPABASE'
      : previaBanco
        ? 'SUPABASE SEM AVISOS'
      : erroLeituraBanco
        ? 'FALHA AO LER O SUPABASE'
        : 'CONECTANDO AO SUPABASE';

  useEffect(() => {
    if (tvConectada || avisosBanco.length <= 1) {
      setSegundosRestantes(null);
      return undefined;
    }

    const duracaoSegundos = Math.max(1, Number(avisoBancoAtual?.duracao) || 10);
    const fimDoAviso = Date.now() + duracaoSegundos * 1000;
    setSegundosRestantes(duracaoSegundos);
    const rotationInterval = setInterval(() => {
      const restantes = Math.max(0, Math.ceil((fimDoAviso - Date.now()) / 1000));
      setSegundosRestantes(restantes);
      if (restantes === 0) {
        clearInterval(rotationInterval);
        setIndiceAvisoBanco((indice) => (indice + 1) % avisosBanco.length);
      }
    }, 1000);

    return () => clearInterval(rotationInterval);
  }, [tvConectada, avisosBanco, indiceAvisoBanco, avisoBancoAtual?.duracao]);

  async function executarComando(acao, payload = {}) {
    if (!tvConectada || comandoEmAndamento) return;

    setComandoEmAndamento(true);
    setMensagem('');

    try {
      await enviarComandoTV(acao, payload);
      const nomes = {
        ANTERIOR: 'Aviso anterior enviado',
        PAUSAR: 'Pausa enviada',
        RETOMAR: 'Retomada enviada',
        PROXIMO: 'Próximo aviso enviado',
        FIXAR: 'Aviso fixado',
      };
      setMensagem(nomes[acao] || 'Comando enviado');
    } catch (error) {
      console.error('Erro ao enviar comando para a TV:', error);
      Alert.alert('Falha no controle', 'Não foi possível enviar o comando. Confira a conexão da TV e tente novamente.');
    } finally {
      setComandoEmAndamento(false);
    }
  }

  const botaoDesabilitado = !tvConectada || comandoEmAndamento;
  const acaoFixar = estadoTV?.fixada ? 'RETOMAR' : 'FIXAR';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>PEI BARÃO DE JUNDIAÍ</Text>
          <Text style={styles.title}>CONTROLE DA TV</Text>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, tvConectada ? null : avisosBanco.length > 0 ? styles.statusDotConnecting : styles.statusDotOffline]} />
            <Text style={styles.statusText}>{estadoExibido}</Text>
          </View>
        </View>

        <View style={styles.previewCard}>
          <View style={styles.previewHeader}>
            <View>
              <Text style={styles.previewEyebrow}>{tvConectada ? 'O QUE ESTÁ NA TV' : 'AVISOS DO SUPABASE'}</Text>
              <Text numberOfLines={1} style={styles.previewHeading}>
                {avisoAtual?.titulo || (previaBanco ? 'Nenhum aviso cadastrado' : 'Carregando do Supabase')}
              </Text>
            </View>
            <View style={[styles.liveBadge, tvConectada ? null : avisosBanco.length > 0 ? styles.databaseBadge : styles.offlineBadge]}>
              {!previaBanco && !tvConectada && !erroLeituraBanco ? <ActivityIndicator size="small" color={colors.warning} /> : <View style={[styles.liveDot, tvConectada ? null : avisosBanco.length > 0 ? styles.databaseDot : styles.liveDotOffline]} />}
              <Text style={[styles.liveText, tvConectada ? null : avisosBanco.length > 0 ? styles.databaseText : styles.offlineText]}>
                {tvConectada ? 'TV AO VIVO' : avisosBanco.length > 0 ? `${indiceAvisoBanco + 1}/${avisosBanco.length} · ${segundosRestantes ?? avisoBancoAtual?.duracao ?? 10}s` : previaBanco ? 'SEM AVISOS' : erroLeituraBanco ? 'ERRO' : 'CONECTANDO'}
              </Text>
            </View>
          </View>

          {avisoAtual ? (
            <PreviewDaTV aviso={avisoAtual} textoLetreiro={letreiroAtual} />
          ) : (
            <View style={styles.previewOffline}>
              <Tv size={35} color={colors.textMuted} />
              <Text style={styles.offlineTitle}>{previaBanco ? 'Nenhum aviso encontrado' : erroLeituraBanco ? 'Não foi possível ler o Supabase' : 'Buscando avisos no Supabase...'}</Text>
              <Text style={styles.offlineDescription}>
                {previaBanco ? 'Cadastre um aviso na tabela avisos para exibir a prévia.' : erroLeituraBanco ? 'Confira a conexão com a internet e as permissões de leitura da tabela avisos.' : 'A prévia aparecerá assim que o banco responder.'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, botaoDesabilitado && styles.buttonDisabled]}
            onPress={() => executarComando('ANTERIOR')}
            disabled={botaoDesabilitado}
            activeOpacity={0.75}
          >
            <SkipBack size={31} color={colors.primary} />
            <Text style={styles.buttonText}>ANTERIOR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, botaoDesabilitado && styles.buttonDisabled]}
            onPress={() => executarComando('PAUSAR')}
            disabled={botaoDesabilitado || Boolean(estadoTV?.pausada)}
            activeOpacity={0.75}
          >
            <CirclePause size={31} color={colors.warning} />
            <Text style={styles.buttonText}>PAUSAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, botaoDesabilitado && styles.buttonDisabled]}
            onPress={() => executarComando('RETOMAR')}
            disabled={botaoDesabilitado || (!estadoTV?.pausada && !estadoTV?.fixada)}
            activeOpacity={0.75}
          >
            <CirclePlay size={31} color={colors.success} />
            <Text style={styles.buttonText}>RETOMAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, botaoDesabilitado && styles.buttonDisabled]}
            onPress={() => executarComando('PROXIMO')}
            disabled={botaoDesabilitado}
            activeOpacity={0.75}
          >
            <SkipForward size={31} color={colors.primary} />
            <Text style={styles.buttonText}>PRÓXIMO</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.fixButton, botaoDesabilitado && styles.buttonDisabled]}
          onPress={() => executarComando(acaoFixar, acaoFixar === 'FIXAR' && avisoAtual?.id ? { slideId: avisoAtual.id } : {})}
          disabled={botaoDesabilitado || (!avisoAtual && acaoFixar === 'FIXAR')}
          activeOpacity={0.8}
        >
          <Pin size={22} color="#FFFFFF" />
          <Text style={styles.fixText}>{estadoTV?.fixada ? 'DESFIXAR AVISO' : 'FIXAR AVISO ATUAL'}</Text>
        </TouchableOpacity>

        <Text style={styles.helperText}>
          {tvConectada
            ? 'Prévia sincronizada com o aviso exibido na TV. Os comandos atuam sobre essa tela.'
            : avisosBanco.length > 0
              ? `Exibindo ${indiceAvisoBanco + 1} de ${avisosBanco.length} avisos do Supabase, com a duração cadastrada em cada um.`
              : `Conexão de controle: ${statusCanal}. A tela é carregada diretamente da tabela avisos.`}
        </Text>
        {mensagem ? <Text style={styles.feedbackText}>{mensagem}</Text> : null}
        {erroLeituraBanco ? (
          <Text style={styles.connectionError}>Não foi possível atualizar a prévia do Supabase.</Text>
        ) : null}
        {statusCanal !== 'SUBSCRIBED' && statusCanal !== 'CONNECTING' ? (
          <Text style={styles.connectionError}>Não foi possível conectar ao Supabase ({statusCanal}).</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 17,
    paddingBottom: 24,
    justifyContent: 'center',
  },
  heading: {
    alignItems: 'center',
    marginBottom: 15,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.6,
  },
  title: {
    color: colors.text,
    fontSize: 25,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 3,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 5,
    backgroundColor: colors.success,
    marginRight: 7,
  },
  statusDotOffline: {
    backgroundColor: colors.danger,
  },
  statusDotConnecting: {
    backgroundColor: colors.warning,
  },
  statusText: {
    color: colors.textSecondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
  },
  previewCard: {
    backgroundColor: colors.surface,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    marginBottom: 14,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  previewEyebrow: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  previewHeading: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    maxWidth: 210,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: 'rgba(0,255,136,0.1)',
  },
  offlineBadge: {
    backgroundColor: 'rgba(255,23,68,0.1)',
  },
  databaseBadge: {
    backgroundColor: 'rgba(255,214,0,0.1)',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  liveDotOffline: {
    backgroundColor: colors.danger,
  },
  databaseDot: {
    backgroundColor: colors.warning,
  },
  liveText: {
    color: colors.success,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.7,
  },
  offlineText: {
    color: colors.danger,
  },
  databaseText: {
    color: colors.warning,
  },
  previewFrame: {
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#020617',
  },
  previewContent: {
    height: 174,
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#060b19',
  },
  previewSplit: {
    alignItems: 'stretch',
  },
  previewMedia: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    left: 9,
    right: 9,
    bottom: 9,
    padding: 9,
    borderRadius: 9,
    backgroundColor: 'rgba(6,11,25,0.87)',
  },
  previewText: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 8,
    paddingVertical: 9,
    justifyContent: 'center',
    backgroundColor: '#0b1222',
  },
  previewTextOnly: {
    paddingHorizontal: 20,
  },
  previewTitle: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  previewDescription: {
    color: '#d2dbea',
    fontSize: 9,
    lineHeight: 13,
    marginTop: 5,
  },
  previewSchedule: {
    color: colors.primary,
    fontSize: 8,
    fontWeight: '800',
    marginTop: 5,
  },
  noMedia: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  noMediaText: {
    color: colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  previewTicker: {
    height: 22,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111a36',
    overflow: 'hidden',
  },
  tickerLabel: {
    height: '100%',
    paddingHorizontal: 9,
    textAlignVertical: 'center',
    color: '#060b19',
    backgroundColor: colors.primary,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tickerText: {
    flex: 1,
    color: colors.text,
    paddingHorizontal: 8,
    fontSize: 8,
    fontWeight: '700',
  },
  previewOffline: {
    height: 174,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#060b19',
  },
  offlineTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  offlineDescription: {
    color: colors.textMuted,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
    marginTop: 5,
  },
  emptyNotice: {
    color: colors.textMuted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 8,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 9,
  },
  controlButton: {
    width: '48%',
    height: 82,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 7,
  },
  buttonDisabled: {
    opacity: 0.42,
  },
  fixButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  fixText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 13,
    marginTop: 12,
  },
  feedbackText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 6,
  },
  connectionError: {
    color: colors.danger,
    fontSize: 9,
    textAlign: 'center',
    marginTop: 5,
  },
});
