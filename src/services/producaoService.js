import { supabase } from "../supabaseClient";

export async function buscarProducoesDoUsuario() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("producoes")
    .select("*")
    .eq("usuario_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar produções:", error.message);
    return [];
  }

  return data;
}

export async function adicionarProducao(novaProducao) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const dataInsercao = {
    ...novaProducao,
    usuario_id: user.id,
    volume_plantado: novaProducao.volume_plantado ? Number(novaProducao.volume_plantado) : null,
    volume_colhido: novaProducao.volume_colhido ? Number(novaProducao.volume_colhido) : null,
    latitude: novaProducao.latitude ? Number(novaProducao.latitude) : null,
    longitude: novaProducao.longitude ? Number(novaProducao.longitude) : null,
    data_plantio: novaProducao.data_plantio || null,
    data_colheita: novaProducao.data_colheita || null,
  };

  const { data, error } = await supabase
    .from("producoes")
    .insert([dataInsercao])
    .select()
    .single();

  if (error) {
    console.error("Erro ao adicionar produção:", error.message);
    return null;
  }

  return data;
}

export async function atualizarProducao(id, dadosAtualizados) {
  const dadosFormatados = {
    ...dadosAtualizados,
    volume_plantado: dadosAtualizados.volume_plantado ? Number(dadosAtualizados.volume_plantado) : null,
    volume_colhido: dadosAtualizados.volume_colhido ? Number(dadosAtualizados.volume_colhido) : null,
    latitude: dadosAtualizados.latitude ? Number(dadosAtualizados.latitude) : null,
    longitude: dadosAtualizados.longitude ? Number(dadosAtualizados.longitude) : null,
    data_plantio: dadosAtualizados.data_plantio || null,
    data_colheita: dadosAtualizados.data_colheita || null,
  };

  const { error } = await supabase
    .from("producoes")
    .update(dadosFormatados)
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar produção:", error.message);
    return false;
  }

  return true;
}

export async function excluirProducao(id) {
  const { error } = await supabase
    .from("producoes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir produção:", error.message);
    return false;
  }

  return true;
}
