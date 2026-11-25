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
import {
  CirclePause,
  CirclePlay,
  Pin,
  SkipBack,
  SkipForward,
  Tv,
} from 'lucide-react-native';

import PreviewDaTV from '../components/PreviewDaTV';
import { conectarControleTV, enviarComandoTV } from '../services/remoteControl';
import colors from '../theme/colors';

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
  const duracaoGravada = Number(avisoAtual?.duracao);
  const duracaoAviso = Number.isFinite(duracaoGravada) && duracaoGravada > 0 ? duracaoGravada : 10;
  const tituloAvisoAtual = avisoAtual && (avisoAtual.titulo || 'Aviso sem título');
  const letreiroAtual = tvConectada ? estadoTV.letreiro : previaBanco?.letreiro;
  const estadoExibido = tvConectada
    ? estadoTV.pausada
      ? 'TV PAUSADA'
      : estadoTV.fixada
        ? 'AVISO FIXADO'
        : 'TV AO VIVO'
    : statusCanal === 'SUBSCRIBED'
      ? 'SUPABASE CONECTADO'
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

    const fimDoAviso = Date.now() + duracaoAviso * 1000;
    setSegundosRestantes(duracaoAviso);
    const rotationInterval = setInterval(() => {
      const restantes = Math.max(0, Math.ceil((fimDoAviso - Date.now()) / 1000));
      setSegundosRestantes(restantes);
      if (restantes === 0) {
        clearInterval(rotationInterval);
        setIndiceAvisoBanco((indice) => (indice + 1) % avisosBanco.length);
      }
    }, 1000);

    return () => clearInterval(rotationInterval);
  }, [tvConectada, avisosBanco, indiceAvisoBanco, duracaoAviso]);

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
    <View style={styles.screen}>
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
              <Text style={styles.previewEyebrow}>{tvConectada ? 'O QUE ESTÁ NA TV' : 'PRÉVIA DO MURAL'}</Text>
              <Text numberOfLines={1} style={styles.previewHeading}>
                {tituloAvisoAtual || (previaBanco ? 'Nenhum aviso cadastrado' : 'Carregando do Supabase')}
              </Text>
            </View>
            <View style={[styles.liveBadge, tvConectada ? null : avisosBanco.length > 0 ? styles.databaseBadge : styles.offlineBadge]}>
              {!previaBanco && !tvConectada && !erroLeituraBanco ? <ActivityIndicator size="small" color={colors.warning} /> : <View style={[styles.liveDot, tvConectada ? null : avisosBanco.length > 0 ? styles.databaseDot : styles.liveDotOffline]} />}
              <Text style={[styles.liveText, tvConectada ? null : avisosBanco.length > 0 ? styles.databaseText : styles.offlineText]}>
                {tvConectada ? 'TV AO VIVO' : avisosBanco.length > 0 ? `${indiceAvisoBanco + 1}/${avisosBanco.length}` : previaBanco ? 'SEM AVISOS' : erroLeituraBanco ? 'ERRO' : 'CONECTANDO'}
              </Text>
            </View>
          </View>

          {avisoAtual ? (
            <PreviewDaTV aviso={avisoAtual} textoLetreiro={letreiroAtual} tvConectada={tvConectada} />
          ) : (
            <View style={styles.previewOffline}>
              <Tv size={35} color={colors.textMuted} />
              <Text style={styles.offlineTitle}>{previaBanco ? 'Nenhum aviso encontrado' : erroLeituraBanco ? 'Não foi possível ler o Supabase' : 'Buscando avisos no Supabase...'}</Text>
              <Text style={styles.offlineDescription}>
                {previaBanco ? 'Cadastre um aviso na tabela avisos para exibir a prévia.' : erroLeituraBanco ? 'Confira a conexão com a internet e as permissões de leitura da tabela avisos.' : 'A prévia aparecerá assim que o banco responder.'}
              </Text>
            </View>
          )}
          {avisoAtual && (
            <Text style={styles.helperText}>
              Duração cadastrada {duracaoAviso}s
              {!tvConectada && segundosRestantes != null ? ` · Troca em ${segundosRestantes}s` : ''}
            </Text>
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
            : 'Abra a tela da TV no navegador que exibe o mural. O app sincroniza automaticamente assim que ela entrar online.'}
        </Text>
        {mensagem ? <Text style={styles.feedbackText}>{mensagem}</Text> : null}
        {erroLeituraBanco ? (
          <Text style={styles.connectionError}>Não foi possível atualizar a prévia do Supabase.</Text>
        ) : null}
        {statusCanal !== 'SUBSCRIBED' && statusCanal !== 'CONNECTING' ? (
          <Text style={styles.connectionError}>Não foi possível conectar ao Supabase ({statusCanal}).</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
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
