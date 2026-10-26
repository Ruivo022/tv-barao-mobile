
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import colors from '../theme/colors';

export default function Screen() {
  const [temaEscuro, setTemaEscuro] = useState(true);

  const [nome, setNome] = useState('Administrador TV Barão');
  const [email, setEmail] = useState('admin@tvbarao.com.br');
  const [editando, setEditando] = useState(false);
  const [foto, setFoto] = useState(null);

  const tema = temaEscuro
    ? {
        fundo: colors.background,
        card: '#0D1424',
        texto: '#FFFFFF',
        secundario: '#8B9AB3',
        borda: '#1B2639',
        campo: '#080D19',
      }
    : {
        fundo: '#F2F5FA',
        card: '#FFFFFF',
        texto: '#172033',
        secundario: '#64748B',
        borda: '#DCE3ED',
        campo: '#F8FAFC',
      };

  async function escolherFoto() {
    const permissao =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        'Permita o acesso à galeria para escolher sua foto.'
      );
      return;
    }

    const resultado =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

    if (!resultado.canceled) {
      setFoto(resultado.assets[0].uri);
    }
  }

  function salvarPerfil() {
    if (!nome.trim() || !email.trim()) {
      Alert.alert('Atenção', 'Preencha o nome e o e-mail.');
      return;
    }

    setEditando(false);

    Alert.alert(
      'Perfil atualizado',
      'Os dados foram atualizados nesta tela.'
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: tema.fundo }}
      contentContainerStyle={styles.container}
    >
      <Text style={styles.eyebrow}>
        TV BARÃO DE JUNDIAÍ
      </Text>

      <Text style={[styles.heading, { color: tema.texto }]}>
        GERENCIAR
      </Text>

      <Text style={[styles.subtitle, { color: tema.secundario }]}>
        Personalize o aplicativo e gerencie sua conta.
      </Text>

      {/* APARÊNCIA */}

      <View
        style={[
          styles.card,
          { backgroundColor: tema.card, borderColor: tema.borda },
        ]}
      >
        <Text style={styles.sectionTitle}>APARÊNCIA</Text>

        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>◐</Text>
          </View>

          <View style={styles.rowContent}>
            <Text style={[styles.itemTitle, { color: tema.texto }]}>
              Tema escuro
            </Text>

            <Text style={[styles.itemSubtitle, { color: tema.secundario }]}>
              {temaEscuro
                ? 'Visual escuro ativado'
                : 'Visual claro ativado'}
            </Text>
          </View>

          <Switch
            value={temaEscuro}
            onValueChange={setTemaEscuro}
            trackColor={{ false: '#CBD5E1', true: '#482485' }}
            thumbColor={temaEscuro ? '#00D9F5' : '#FFFFFF'}
          />
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>
              {temaEscuro ? '🌙' : '☀️'}
            </Text>
          </View>

          <View style={styles.rowContent}>
            <Text style={[styles.itemTitle, { color: tema.texto }]}>
              Prévia do tema
            </Text>

            <Text style={[styles.itemSubtitle, { color: tema.secundario }]}>
              {temaEscuro ? 'Modo noturno' : 'Modo diurno'}
            </Text>
          </View>
        </View>
      </View>

      {/* PERFIL */}

      <View
        style={[
          styles.card,
          { backgroundColor: tema.card, borderColor: tema.borda },
        ]}
      >
        <Text style={styles.sectionTitle}>MEU PERFIL</Text>

        <View style={styles.profileHeader}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={escolherFoto}
          >
            {foto ? (
              <Image source={{ uri: foto }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {nome.trim().charAt(0).toUpperCase() || '?'}
              </Text>
            )}

            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>+</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: tema.texto }]}>
              {nome || 'Seu nome'}
            </Text>

            <Text style={[styles.itemSubtitle, { color: tema.secundario }]}>
              Administrador
            </Text>

            <TouchableOpacity onPress={escolherFoto}>
              <Text style={styles.link}>Alterar foto</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.label, { color: tema.texto }]}>
          Nome completo
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: tema.campo,
              color: tema.texto,
              borderColor: tema.borda,
            },
          ]}
          value={nome}
          onChangeText={setNome}
          editable={editando}
          placeholder="Seu nome"
          placeholderTextColor={tema.secundario}
        />

        <Text style={[styles.label, { color: tema.texto }]}>
          E-mail
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: tema.campo,
              color: tema.texto,
              borderColor: tema.borda,
            },
          ]}
          value={email}
          onChangeText={setEmail}
          editable={editando}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="seu@email.com"
          placeholderTextColor={tema.secundario}
        />

        {editando ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => setEditando(false)}
            >
              <Text style={styles.secondaryButtonText}>
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={salvarPerfil}
            >
              <Text style={styles.primaryButtonText}>
                Salvar alterações
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => setEditando(true)}
          >
            <Text style={styles.primaryButtonText}>
              Editar perfil
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* CONTA */}

      <View
        style={[
          styles.card,
          { backgroundColor: tema.card, borderColor: tema.borda },
        ]}
      >
        <Text style={styles.sectionTitle}>CONTA</Text>

        <View style={styles.row}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>ⓘ</Text>
          </View>

          <View style={styles.rowContent}>
            <Text style={[styles.itemTitle, { color: tema.texto }]}>
              TV Barão
            </Text>

            <Text style={[styles.itemSubtitle, { color: tema.secundario }]}>
              Gerenciamento de avisos escolares
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() =>
            Alert.alert(
              'Sair da conta',
              'Para ativar esta opção, conecte-a ao sistema de autenticação do aplicativo.'
            )
          }
        >
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.footer, { color: tema.secundario }]}>
        TV BARÃO • Configurações do aplicativo
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
  },
  sectionTitle: {
    color: '#00D9F5',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#172238',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#00D9F5',
    fontSize: 22,
  },
  rowContent: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#29364D',
    marginVertical: 18,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 12,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#482485',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 76,
    height: 76,
    borderRadius: 38,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '900',
  },
  editBadge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    backgroundColor: '#00D9F5',
    width: 25,
    height: 25,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadgeText: {
    color: '#07111D',
    fontSize: 18,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '900',
  },
  link: {
    color: '#00D9F5',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 13,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#482485',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    flex: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  secondaryButton: {
    backgroundColor: '#29364D',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  secondaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  logoutButton: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#703443',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF7185',
    fontSize: 13,
    fontWeight: '800',
  },
  footer: {
    textAlign: 'center',
    fontSize: 11,
    marginTop: 4,
  },
});
