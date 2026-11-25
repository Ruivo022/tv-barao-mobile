import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { adicionarLetreiro, excluirLetreiro, listarLetreiros } from '../services/letreiroService';
import colors from '../theme/colors';

export default function AlertScreen() {
  const [avisos, setAvisos] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erroDeLeitura, setErroDeLeitura] = useState(false);
  const [operacao, setOperacao] = useState(null);
  const [confirmacao, setConfirmacao] = useState(null);
  const [retorno, setRetorno] = useState(null);
  const consultaAtual = useRef(0);
  const gravando = useRef(false);

  const atualizar = useCallback(async () => {
    const consulta = ++consultaAtual.current;
    setCarregando(true);
    setErroDeLeitura(false);

    try {
      const registros = await listarLetreiros();
      if (consulta === consultaAtual.current) setAvisos(registros);
    } catch {
      if (consulta === consultaAtual.current) setErroDeLeitura(true);
    } finally {
      if (consulta === consultaAtual.current) setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    void atualizar();
  }, [atualizar]));

  async function executar(tipo, acao, mensagemDeErro) {
    if (gravando.current) return;

    gravando.current = true;
    setOperacao(tipo);
    setRetorno(null);
    try {
      await acao();
    } catch {
      setRetorno({ erro: true, texto: mensagemDeErro });
    } finally {
      await atualizar();
      setOperacao(null);
      gravando.current = false;
    }
  }

  async function publicar() {
    if (!mensagem.trim()) {
      setRetorno({ erro: true, texto: 'Digite uma mensagem para o rodapé.' });
      return;
    }

    await executar('publicar', async () => {
      const novoAviso = await adicionarLetreiro(mensagem);
      setAvisos((lista) => [novoAviso, ...lista.filter(({ id }) => id !== novoAviso.id)]);
      setMensagem('');
      setConfirmacao(null);
      setRetorno({ texto: 'Aviso publicado no rodapé.' });
    }, 'Não foi possível confirmar a publicação. Confira a lista antes de tentar novamente.');
  }

  async function excluir(id) {
    await executar('excluir', async () => {
      if (!(await excluirLetreiro(id))) {
        setRetorno({ erro: true, texto: 'O aviso já foi removido ou sua conta não tem permissão para excluí-lo.' });
        setConfirmacao(null);
        return;
      }

      setAvisos((lista) => lista.filter((aviso) => aviso.id !== id));
      setConfirmacao(null);
      setRetorno({ texto: 'Aviso excluído.' });
    }, 'Não foi possível excluir o aviso. Confira a conexão e as permissões da conta.');
  }

  function renderAviso({ item, index }) {
    const selecionado = confirmacao === item.id;

    return (
      <View style={styles.card}>
        {index === 0 && <Text style={styles.ativo}>ATIVO NO RODAPÉ</Text>}
        <Text style={styles.mensagem}>{item.descricao}</Text>

        {selecionado && (
          <Text style={styles.secundario}>Excluir este aviso do rodapé?</Text>
        )}
        <View style={styles.acoes}>
          {selecionado && (
            <Pressable
              style={styles.acao}
              onPress={() => setConfirmacao(null)}
              disabled={!!operacao}
              accessibilityRole="button"
            >
              <Text style={styles.secundario}>Cancelar</Text>
            </Pressable>
          )}
          <Pressable
            style={styles.acao}
            onPress={selecionado ? () => excluir(item.id) : () => setConfirmacao(item.id)}
            disabled={!!operacao}
            accessibilityRole="button"
          >
            <Text style={styles.excluir}>
              {selecionado ? 'Confirmar exclusão' : 'Excluir'}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.tela}
      contentContainerStyle={styles.conteudo}
      keyboardShouldPersistTaps="handled"
      data={avisos}
      keyExtractor={(item) => String(item.id)}
      renderItem={renderAviso}
      refreshing={carregando}
      onRefresh={atualizar}
      ListHeaderComponent={(
        <View>
          <Text style={styles.sobretitulo}>TV BARÃO DE JUNDIAÍ</Text>
          <Text style={styles.titulo}>AVISOS DO RODAPÉ</Text>
          <Text style={styles.introducao}>A TV exibe a mensagem mais recente desta lista.</Text>

          <View style={styles.card}>
            <Text style={styles.campo}>Nova mensagem</Text>
            <TextInput
              accessibilityLabel="Nova mensagem para o rodapé"
              style={styles.entrada}
              placeholder="Digite o texto que vai passar no rodapé…"
              placeholderTextColor={colors.textSecondary}
              value={mensagem}
              onChangeText={setMensagem}
              editable={!operacao}
              multiline
              maxLength={1000}
              textAlignVertical="top"
            />
            <Pressable
              style={[styles.publicar, operacao && styles.desabilitado]}
              onPress={publicar}
              disabled={!!operacao}
              accessibilityRole="button"
            >
              {operacao === 'publicar' ? <ActivityIndicator color={colors.background} /> : (
                <Text style={styles.publicarTexto}>Publicar no rodapé</Text>
              )}
            </Pressable>
          </View>

          {!!retorno && (
            <Text
              style={[styles.retorno, retorno.erro && styles.erro]}
              accessibilityLiveRegion="polite"
            >
              {retorno.texto}
            </Text>
          )}
          {erroDeLeitura && (
            <Text style={styles.erro} accessibilityLiveRegion="polite">
              Não foi possível atualizar a lista de avisos.
            </Text>
          )}

          <View style={styles.cabecalhoDaLista}>
            <Text style={styles.campo}>Mensagens cadastradas</Text>
            <Pressable style={styles.acao} onPress={atualizar} disabled={carregando || !!operacao} accessibilityRole="button">
              <Text style={styles.atualizar}>Atualizar</Text>
            </Pressable>
          </View>
        </View>
      )}
      ListEmptyComponent={(
        <Text style={styles.vazio}>
          {carregando ? 'Carregando avisos…' : erroDeLeitura ? 'Tente atualizar a lista.' : 'Nenhum aviso no rodapé.'}
        </Text>
      )}
    />
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: colors.background },
  conteudo: { padding: 20, paddingBottom: 40 },
  sobretitulo: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 3, marginBottom: 8 },
  titulo: { color: colors.text, fontSize: 24, fontWeight: '900' },
  introducao: { color: colors.textSecondary, fontSize: 14, marginTop: 8, marginBottom: 20 },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  campo: { color: colors.text, fontSize: 14, fontWeight: '800' },
  entrada: {
    minHeight: 98,
    backgroundColor: colors.background,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    fontSize: 14,
    marginTop: 10,
  },
  publicar: { backgroundColor: colors.primary, minHeight: 46, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  publicarTexto: { color: colors.background, fontSize: 14, fontWeight: '900' },
  desabilitado: { opacity: 0.6 },
  cabecalhoDaLista: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  ativo: { color: colors.primary, fontSize: 11, letterSpacing: 1, fontWeight: '900', marginBottom: 8 },
  mensagem: { color: colors.text, fontSize: 15, lineHeight: 22, marginBottom: 8 },
  acoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end' },
  acao: { minHeight: 44, paddingHorizontal: 8, justifyContent: 'center' },
  secundario: { color: colors.textSecondary, fontSize: 13 },
  atualizar: { color: colors.primary, fontSize: 13, fontWeight: '700' },
  excluir: { color: '#FF7185', fontSize: 13, fontWeight: '800' },
  retorno: { color: colors.success, fontSize: 13, marginBottom: 6 },
  erro: { color: '#FF7185', fontSize: 13 },
  vazio: { color: colors.textSecondary, textAlign: 'center', padding: 24 },
});
