import React, { useEffect, useState } from 'react';
import { ActivityIndicator, AppState, Platform, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import LoginScreen from './src/screens/LoginScreen';
import { confirmarBiometria, lerBiometria, salvarBiometria } from './src/services/biometria';
import { supabase } from './src/services/supabase';
import colors from './src/theme/colors';

export default function App() {
  const [sessao, setSessao] = useState(undefined);
  const [usuarioLiberado, setUsuarioLiberado] = useState(null);
  const [usuarioComOferta, setUsuarioComOferta] = useState(null);
  const [biometria, setBiometria] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, atual) => {
      setSessao(atual);
      if (!atual) {
        setUsuarioLiberado(null);
        setUsuarioComOferta(null);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let ativo = true;
    lerBiometria()
      .then((configuracao) => { if (ativo) setBiometria(configuracao); })
      .catch(() => { if (ativo) setBiometria({ nome: null, usuarioId: null }); });
    return () => { ativo = false; };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') return;

    function atualizarSessao(estado) {
      if (estado === 'active') {
        void supabase.auth.startAutoRefresh();
      } else {
        void supabase.auth.stopAutoRefresh();
      }
    }

    atualizarSessao(AppState.currentState);
    const subscription = AppState.addEventListener('change', atualizarSessao);
    return () => {
      subscription.remove();
      void supabase.auth.stopAutoRefresh();
    };
  }, []);

  async function entrar(email, senha) {
    if (!email.endsWith('@prof.educacao.sp.gov.br') && email !== 'luisgc9872@gmail.com') {
      throw new Error('Use o mesmo e-mail autorizado a acessar o painel web.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });
    if (error?.code === 'invalid_credentials') throw new Error('E-mail ou senha inválidos.');
    if (error || !data.session) throw new Error('Não foi possível entrar. Confira sua conexão e se a conta está ativa.');

    setSessao(data.session);
    const usuarioId = data.session.user.id;
    if (biometria?.nome && biometria.usuarioId !== usuarioId) {
      setUsuarioComOferta(usuarioId);
    } else {
      setUsuarioLiberado(usuarioId);
    }
  }

  async function desbloquear() {
    const usuarioId = sessao?.user.id;
    if (!biometria?.nome || !usuarioId || biometria.usuarioId !== usuarioId) return;
    if (!(await confirmarBiometria('Desbloquear a TV Barão'))) return;

    const { data, error } = await supabase.auth.getUser();
    if (error || data.user?.id !== usuarioId) {
      throw new Error('Não foi possível validar a sessão. Entre novamente com e-mail e senha.');
    }
    setUsuarioLiberado(usuarioId);
  }

  async function alterarBiometria(ativar) {
    const usuarioId = sessao?.user.id;
    const podeConfigurar = usuarioId && (usuarioId === usuarioLiberado || usuarioId === usuarioComOferta);
    if (!podeConfigurar) return false;
    if (ativar && !(await confirmarBiometria('Ativar o desbloqueio da TV Barão'))) return false;

    const { data, error } = await supabase.auth.getSession();
    if (error || data.session?.user.id !== usuarioId) {
      throw new Error('Sua sessão mudou. Entre novamente com e-mail e senha.');
    }

    const id = ativar ? usuarioId : null;
    await salvarBiometria(id);
    setBiometria((anterior) => ({ ...anterior, usuarioId: id }));
    return true;
  }

  async function concluirOferta(ativar) {
    const usuarioId = sessao?.user.id;
    if (!usuarioId || usuarioId !== usuarioComOferta) return;
    if (ativar && !(await alterarBiometria(true))) return;

    setUsuarioComOferta(null);
    setUsuarioLiberado(usuarioId);
  }

  async function sair() {
    const { error } = await supabase.auth.signOut({ scope: 'local' });
    if (error) throw error;

    setUsuarioLiberado(null);
    setBiometria((anterior) => ({ ...anterior, usuarioId: null }));
    await salvarBiometria(null);
  }

  const usuario = sessao?.user;
  const liberado = Boolean(usuario && usuario.id === usuarioLiberado);
  const biometriaAtiva = Boolean(usuario && biometria?.nome && biometria.usuarioId === usuario.id);
  const exibindoOferta = Boolean(usuario && usuario.id === usuarioComOferta);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <StatusBar style="light" />
      {sessao === undefined || biometria === null ? (
        <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : liberado ? (
        <AppNavigator
          usuario={usuario}
          nomeBiometria={biometria.nome}
          biometriaAtiva={biometriaAtiva}
          aoAlterarBiometria={alterarBiometria}
          aoSair={sair}
        />
      ) : (
        <LoginScreen
          aoEntrar={entrar}
          aoDesbloquear={desbloquear}
          nomeBiometria={biometriaAtiva ? biometria.nome : null}
          ofertaBiometria={exibindoOferta ? biometria?.nome : null}
          aoConcluirOferta={concluirOferta}
        />
      )}
    </SafeAreaProvider>
  );
}
