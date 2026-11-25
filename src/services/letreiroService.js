import { supabase } from './supabase';

const CATEGORIA = 'Letreiro';
const CAMPOS = 'id,descricao,created_at';

function consultarLetreiros(campos) {
  return supabase.from('avisos')
    .select(campos)
    .ilike('categoria', CATEGORIA)
    .order('id', { ascending: false });
}

export async function listarLetreiros() {
  const { data, error } = await consultarLetreiros(CAMPOS);
  if (error) throw error;
  return data ?? [];
}

export async function lerLetreiroAtual() {
  const { data, error } = await consultarLetreiros('descricao').limit(1).maybeSingle();
  if (error) throw error;
  return data?.descricao ?? '';
}

export async function adicionarLetreiro(mensagem) {
  const { data, error } = await supabase.from('avisos')
    .insert({ titulo: 'LETREIRO', descricao: mensagem.trim(), categoria: CATEGORIA, duracao: 0 })
    .select(CAMPOS)
    .single();
  if (error) throw error;
  return data;
}

export async function excluirLetreiro(id) {
  const { data, error } = await supabase.from('avisos')
    .delete()
    .eq('id', id)
    .ilike('categoria', CATEGORIA)
    .select('id')
    .maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
