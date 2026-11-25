import { File } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { supabase } from './supabase';

const BUCKET = 'imagens-mural';
const TAMANHO_MAXIMO = 6 * 1024 * 1024;

async function prepararFoto(imagem) {
  const contexto = ImageManipulator.manipulate(imagem.uri);
  if (Math.max(imagem.width, imagem.height) > 1920) {
    contexto.resize(imagem.width >= imagem.height ? { width: 1920 } : { height: 1920 });
  }

  const renderizada = await contexto.renderAsync();
  const { uri } = await renderizada.saveAsync({ format: SaveFormat.JPEG, compress: 0.8 });
  if (Platform.OS === 'web') {
    const resposta = await fetch(uri);
    if (!resposta.ok) throw new Error('Não foi possível ler a imagem.');
    return resposta.arrayBuffer();
  }

  const arquivo = new File(uri);
  try {
    return await arquivo.arrayBuffer();
  } finally {
    if (arquivo.exists) arquivo.delete();
  }
}

function falhaDePublicacao(etapa, erro) {
  const status = String(erro.statusCode ?? erro.status ?? '');
  if (erro.code === '42501' || erro.error === 'AccessDenied' || status === '403' ||
      /row-level security/i.test(erro.message ?? '')) {
    return new Error(`O Supabase recusou a permissão para ${etapa}. Confira se sua conta tem acesso para publicar.`);
  }
  if (status === '401' || erro.code === 'PGRST301') {
    return new Error('Sua sessão expirou. Saia da conta e entre novamente.');
  }
  return new Error(`Não foi possível ${etapa}. Confira a conexão e tente novamente.`);
}

async function enviarFoto(imagem, usuarioId, tentativa) {
  const storage = supabase.storage.from(BUCKET);
  tentativa.caminho ??= `${usuarioId}/${Date.now()}_${Math.random().toString(36).slice(2)}.jpg`;
  const { data: { publicUrl } } = storage.getPublicUrl(tentativa.caminho);

  if (!tentativa.enviada) {
    // Verifica se o envio anterior chegou ao Storage antes de repetir a operação.
    if (tentativa.envioIniciado) {
      const resposta = await fetch(publicUrl, { method: 'HEAD' });
      tentativa.enviada = resposta.ok;
    }

    if (!tentativa.enviada) {
      let foto;
      try {
        foto = await prepararFoto(imagem);
      } catch {
        throw new Error('Não foi possível preparar a foto. Escolha outra imagem e tente novamente.');
      }
      if (!foto.byteLength || foto.byteLength > TAMANHO_MAXIMO) {
        throw new Error('Escolha uma foto que fique abaixo de 6 MB após a conversão.');
      }

      tentativa.envioIniciado = true;
      const { error } = await storage.upload(tentativa.caminho, foto, {
        contentType: 'image/jpeg',
        upsert: false,
      });
      if (error) throw falhaDePublicacao('enviar a foto', error);
      tentativa.enviada = true;
    }
  }

  return publicUrl;
}

export async function publicarAviso({ imagem, titulo, descricao, categoria, usuarioId, tentativa }) {
  const { data: { session }, error: erroSessao } = await supabase.auth.getSession();
  if (erroSessao || session?.user.id !== usuarioId) {
    throw new Error('Entre com sua conta para publicar na TV.');
  }

  const linkFundo = imagem ? await enviarFoto(imagem, usuarioId, tentativa) : '';

  if (linkFundo && tentativa.gravacaoIniciada) {
    // Uma resposta perdida após o INSERT pode significar que o aviso já existe.
    const { data, error } = await supabase.from('avisos')
      .select('id').eq('link_fundo', linkFundo).limit(1);
    if (error) throw falhaDePublicacao('verificar se o aviso já foi gravado', error);
    if (data.length) return;
  }

  tentativa.gravacaoIniciada = true;
  const { error, status } = await supabase.from('avisos').insert({
    titulo,
    descricao,
    categoria,
    duracao: 10,
    horario: '',
    link_fundo: linkFundo,
  });
  if (error) {
    tentativa.gravacaoIniciada = status === 0 || status >= 500 || status == null;
    if (!linkFundo && tentativa.gravacaoIniciada) {
      throw new Error('Não foi possível confirmar a publicação. Confira o mural antes de tentar novamente.');
    }
    throw falhaDePublicacao('gravar o aviso', { ...error, status });
  }
}
