import { supabase } from './supabase';

const canalTV = supabase.channel('canal-tv-barao');

let canalPronto = false;

canalTV.subscribe((status) => {
  console.log('Status do canal TV:', status);

  if (status === 'SUBSCRIBED') {
    canalPronto = true;
    console.log('📺 Conectado ao canal da TV Barão');
  }
});

export async function enviarComandoTV(acao, payload = {}) {
  if (!canalPronto) {
    console.warn('Canal da TV ainda não está conectado.');
    return false;
  }

  const resposta = await canalTV.send({
    type: 'broadcast',
    event: 'comando-remoto',
    payload: {
      acao,
      ...payload,
      timestamp: Date.now(),
    },
  });

  console.log('📡 Comando enviado:', {
    acao,
    payload,
  });

  return resposta;
}