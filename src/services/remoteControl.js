import { AppState } from 'react-native';
import { lerLetreiroAtual } from './letreiroService';
import { supabase } from './supabase';

const CANAL_TV = 'canal-tv-barao';
const INTERVALO_ATUALIZACAO_BANCO = 8000;
const LIMITE_SEM_SINAL_DA_TV = 12000;
let canalControleAtivo = null;

function lerEstadoDaTV(canal) {
  const estados = canal.presenceState();

  for (const clientes of Object.values(estados)) {
    const tv = clientes.find((cliente) => cliente?.papel === 'tv');
    if (tv) return tv;
  }

  return null;
}

async function lerPreviaDoBanco() {
  const camposAviso = 'id,titulo,descricao,categoria,horario,duracao,link_fundo';
  const [avisoResult, letreiro] = await Promise.all([
    supabase
      .from('avisos')
      .select(camposAviso)
      .not('categoria', 'ilike', 'Letreiro')
      .order('id', { ascending: false }),
    lerLetreiroAtual(),
  ]);

  if (avisoResult.error) throw avisoResult.error;
  return {
    avisos: avisoResult.data || [],
    letreiro,
  };
}

export function conectarControleTV({
  aoMudarEstado,
  aoMudarConexao,
  aoMudarPreviaBanco,
  aoFalharLeituraBanco,
}) {
  const canal = supabase.channel(CANAL_TV, {
    config: {
      presence: { key: `mobile-${Date.now()}-${Math.random().toString(36).slice(2)}` },
    },
  });
  canalControleAtivo = canal;

  let ultimoSinal = 0;
  let temporizadorDaTV;

  function limparEstadoDaTV() {
    clearTimeout(temporizadorDaTV);
    ultimoSinal = 0;
    aoMudarEstado(null);
  }

  function receberEstadoDaTV(estado) {
    clearTimeout(temporizadorDaTV);
    ultimoSinal = Date.now();
    aoMudarEstado(estado);
    temporizadorDaTV = setTimeout(limparEstadoDaTV, LIMITE_SEM_SINAL_DA_TV);
  }

  let leituraEmAndamento = false;
  const atualizarPreviaBanco = async () => {
    if (leituraEmAndamento) return;
    leituraEmAndamento = true;

    try {
      const previa = await lerPreviaDoBanco();
      if (canalControleAtivo === canal) aoMudarPreviaBanco?.(previa);
    } catch (error) {
      if (canalControleAtivo === canal) aoFalharLeituraBanco?.(error);
    } finally {
      leituraEmAndamento = false;
    }
  };

  atualizarPreviaBanco();
  const intervaloBanco = setInterval(atualizarPreviaBanco, INTERVALO_ATUALIZACAO_BANCO);

  canal.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'avisos',
  }, atualizarPreviaBanco);

  canal.on('presence', { event: 'sync' }, () => {
    if (canalControleAtivo !== canal || ultimoSinal) return;

    const estado = lerEstadoDaTV(canal);
    if (estado) receberEstadoDaTV(estado);
  });
  canal.on('broadcast', { event: 'estado-tv' }, ({ payload }) => {
    if (canalControleAtivo === canal && payload?.papel === 'tv') receberEstadoDaTV(payload);
  });

  canal.subscribe((status) => {
    if (canalControleAtivo !== canal) return;
    aoMudarConexao(status);
    if (status !== 'SUBSCRIBED') {
      limparEstadoDaTV();
    }
  });

  const appStateSubscription = AppState.addEventListener('change', (estado) => {
    if (estado !== 'active') return;

    if (ultimoSinal && Date.now() - ultimoSinal >= LIMITE_SEM_SINAL_DA_TV) {
      limparEstadoDaTV();
    }
    void atualizarPreviaBanco();
  });

  return () => {
    clearInterval(intervaloBanco);
    clearTimeout(temporizadorDaTV);
    appStateSubscription.remove();
    if (canalControleAtivo === canal) canalControleAtivo = null;
    supabase.removeChannel(canal);
  };
}

export async function enviarComandoTV(acao, payload = {}) {
  if (!canalControleAtivo) {
    throw new Error('O controle da TV ainda não está conectado ao Supabase.');
  }

  const resposta = await canalControleAtivo.send({
    type: 'broadcast',
    event: 'comando-remoto',
    payload: {
      acao,
      ...payload,
      timestamp: Date.now(),
    },
  });

  if (resposta !== 'ok') {
    throw new Error(`O Supabase não confirmou o comando (${resposta}).`);
  }

  return true;
}
