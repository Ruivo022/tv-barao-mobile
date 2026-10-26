
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';

import colors from '../theme/colors';

const CATEGORIAS = [
  { id: 'aula', nome: 'Sem aula', icon: '📅' },
  { id: 'chuva', nome: 'Clima', icon: '🌧️' },
  { id: 'prova', nome: 'Provas', icon: '📚' },
  { id: 'evento', nome: 'Eventos', icon: '🎉' },
  { id: 'geral', nome: 'Geral', icon: '📢' },
];

const INICIAIS = [
  {
    id: '1',
    titulo: 'Aviso aos alunos',
    mensagem:
      'Sejam bem-vindos à TV Barão! Fiquem atentos aos próximos comunicados escolares.',
    categoria: 'geral',
    data: '',
    prioridade: 'normal',
    criadoEm: new Date().toISOString(),
  },
];

export default function Screen() {
  const [alertas, setAlertas] = useState(INICIAIS);
  const [formAberto, setFormAberto] = useState(false);

  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [categoria, setCategoria] = useState('geral');
  const [data, setData] = useState('');
  const [prioridade, setPrioridade] = useState('normal');

  function cadastrarAlerta() {
    if (!titulo.trim() || !mensagem.trim()) {
      Alert.alert(
        'Campos obrigatórios',
        'Informe o título e a mensagem do alerta.'
      );
      return;
    }

    const novoAlerta = {
      id: `${Date.now()}`,
      titulo: titulo.trim(),
      mensagem: mensagem.trim(),
      categoria,
      data: data.trim(),
      prioridade,
      criadoEm: new Date().toISOString(),
    };

    setAlertas((anteriores) => [novoAlerta, ...anteriores]);

    setTitulo('');
    setMensagem('');
    setCategoria('geral');
    setData('');
    setPrioridade('normal');
    setFormAberto(false);

    Alert.alert(
      'Alerta cadastrado',
      'O comunicado foi adicionado à lista desta tela.'
    );
  }

  function excluirAlerta(id) {
    Alert.alert(
      'Excluir comunicado',
      'Deseja realmente excluir este alerta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () =>
            setAlertas((anteriores) =>
              anteriores.filter((item) => item.id !== id)
            ),
        },
      ]
    );
  }

  function renderAlerta({ item }) {
    const tipo = CATEGORIAS.find(
      (cat) => cat.id === item.categoria
    );

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {tipo?.icon} {tipo?.nome.toUpperCase()}
            </Text>
          </View>

          <Text
            style={[
              styles.priority,
              item.prioridade === 'urgente' &&
                styles.priorityUrgente,
            ]}
          >
            {item.prioridade === 'urgente'
              ? '● URGENTE'
              : '● NORMAL'}
          </Text>
        </View>

        <Text style={styles.title}>{item.titulo}</Text>

        <Text style={styles.message}>{item.mensagem}</Text>

        {item.data ? (
          <Text style={styles.info}>
            Data do comunicado: {item.data}
          </Text>
        ) : null}

        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.info}>
            Cadastrado em{' '}
            {new Date(item.criadoEm).toLocaleDateString('pt-BR')}
          </Text>

          <TouchableOpacity
            onPress={() => excluirAlerta(item.id)}
          >
            <Text style={styles.deleteText}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.eyebrow}>TV BARÃO DE JUNDIAÍ</Text>

      <Text style={styles.heading}>ALERTAS DA TV</Text>

      <Text style={styles.subtitle}>
        Comunicados importantes para os alunos.
      </Text>

      <TouchableOpacity
        style={styles.newButton}
        onPress={() => setFormAberto(!formAberto)}
      >
        <Text style={styles.newButtonText}>
          {formAberto ? '✕  Fechar formulário' : '+  Novo alerta'}
        </Text>
      </TouchableOpacity>

      {formAberto && (
        <View style={styles.card}>
          <Text style={styles.formTitle}>
            CRIAR COMUNICADO
          </Text>

          <Text style={styles.label}>Tipo de alerta</Text>

          <View style={styles.categories}>
            {CATEGORIAS.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.categoryButton,
                  categoria === item.id &&
                    styles.categorySelected,
                ]}
                onPress={() => setCategoria(item.id)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    categoria === item.id &&
                      styles.categoryTextSelected,
                  ]}
                >
                  {item.icon} {item.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Título do alerta *</Text>

          <TextInput
            style={styles.input}
            placeholder="Ex.: Não haverá aula na sexta-feira"
            placeholderTextColor="#8493AD"
            value={titulo}
            onChangeText={setTitulo}
            maxLength={120}
          />

          <Text style={styles.label}>Mensagem para os alunos *</Text>

          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Digite os detalhes do comunicado..."
            placeholderTextColor="#8493AD"
            value={mensagem}
            onChangeText={setMensagem}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />

          <Text style={styles.label}>
            Data relacionada ao aviso (opcional)
          </Text>

          <TextInput
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#8493AD"
            value={data}
            onChangeText={setData}
            maxLength={10}
          />

          <Text style={styles.label}>Prioridade</Text>

          <View style={styles.priorityOptions}>
            {[
              { id: 'normal', nome: 'Normal' },
              { id: 'urgente', nome: 'Urgente' },
            ].map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.priorityButton,
                  prioridade === item.id &&
                    styles.prioritySelected,
                ]}
                onPress={() => setPrioridade(item.id)}
              >
                <Text style={styles.priorityButtonText}>
                  {item.id === 'urgente' ? '⚠️ ' : '✓ '}
                  {item.nome}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.publishButton}
            onPress={cadastrarAlerta}
          >
            <Text style={styles.publishText}>
              PUBLICAR COMUNICADO
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          COMUNICADOS CADASTRADOS
        </Text>

        <Text style={styles.count}>{alertas.length}</Text>
      </View>

      <FlatList
        data={alertas}
        keyExtractor={(item) => item.id}
        renderItem={renderAlerta}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Nenhum comunicado cadastrado.
          </Text>
        }
      />

      <Text style={styles.note}>
        Os comunicados desta versão são temporários e ainda não
        são enviados automaticamente para a TV.
      </Text>
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
    color: colors.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 20,
  },
  newButton: {
    backgroundColor: '#482485',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  newButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  card: {
    backgroundColor: '#0D1424',
    borderColor: '#1B2639',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    color: '#00D9F5',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  label: {
    color: '#DCE5F4',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 9,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    borderWidth: 1,
    borderColor: '#34415A',
    backgroundColor: '#080D19',
    borderRadius: 9,
    padding: 10,
  },
  categorySelected: {
    backgroundColor: '#24324A',
    borderColor: '#00D9F5',
  },
  categoryText: {
    color: '#B9C6D9',
    fontSize: 12,
    fontWeight: '700',
  },
  categoryTextSelected: {
    color: '#00D9F5',
  },
  input: {
    backgroundColor: '#080D19',
    borderColor: '#29364D',
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
    color: '#FFFFFF',
    fontSize: 14,
  },
  textArea: {
    minHeight: 110,
  },
  priorityOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  priorityButton: {
    flex: 1,
    padding: 13,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#34415A',
    alignItems: 'center',
  },
  prioritySelected: {
    borderColor: '#00D9F5',
    backgroundColor: '#172238',
  },
  priorityButtonText: {
    color: '#E1EAF8',
    fontSize: 12,
    fontWeight: '800',
  },
  publishButton: {
    backgroundColor: '#482485',
    padding: 17,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 24,
  },
  publishText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  listTitle: {
    color: '#8292AD',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  count: {
    color: '#00D9F5',
    fontWeight: '900',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  badge: {
    backgroundColor: '#00D9F5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 5,
  },
  badgeText: {
    color: '#06101A',
    fontSize: 10,
    fontWeight: '900',
  },
  priority: {
    color: '#00D9A0',
    fontSize: 10,
    fontWeight: '800',
  },
  priorityUrgente: {
    color: '#FF7185',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  message: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 21,
  },
  info: {
    color: '#8493AD',
    fontSize: 11,
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#243047',
    marginVertical: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
  },
  deleteText: {
    color: '#FF7185',
    fontSize: 12,
    fontWeight: '800',
  },
  empty: {
    color: '#8493AD',
    textAlign: 'center',
    padding: 25,
  },
  note: {
    color: '#8493AD',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 10,
    textAlign: 'center',
  },
});
