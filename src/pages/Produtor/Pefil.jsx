import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import styles from "./Perfil.module.css";
import Loading from "../../components/Loading";

export default function PerfilProdutor() {
  const [form, setForm] = useState(null);
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarDados() {
      const { data: auth } = await supabase.auth.getUser();
      const usuario = auth?.user;

      if (!usuario) return;

      const { data, error } = await supabase
        .from("produtores")
        .select("*")
        .eq("usuario_id", usuario.id)
        .single();

      if (error) {
        console.error("Erro ao buscar dados do produtor:", error.message);
      } else {
        setForm(data);
      }

      setCarregando(false);
    }

    buscarDados();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const salvarAlteracoes = async () => {
    const { error } = await supabase
      .from("produtores")
      .update(form)
      .eq("id", form.id);

    if (error) {
      alert("Erro ao salvar alterações.");
      console.error(error);
    } else {
      alert("Alterações salvas com sucesso.");
      setEditando(false);
    }
  };

  if (carregando) return <Loading />;
  if (!form) return <p className={styles.erro}>Dados do produtor não encontrados.</p>;

  return (
    <div className={styles.pagina}>
      <h2>👤 Perfil do Produtor</h2>

      <div className={styles.infoBloco}>
        <h3>Informações Pessoais</h3>
        <div className={styles.linha}>
          <label>Nome:</label>
          <input name="nome" value={form.nome} onChange={handleChange} disabled />
        </div>
        <div className={styles.linha}>
          <label>CPF:</label>
          <input name="cpf" value={form.cpf} onChange={handleChange} disabled />
        </div>
        <div className={styles.linha}>
          <label>Telefone:</label>
          <input name="telefone" value={form.telefone} onChange={handleChange} disabled={!editando} />
        </div>
        <div className={styles.linha}>
          <label>Nascimento:</label>
          <input name="nascimento" type="date" value={form.nascimento} onChange={handleChange} disabled={!editando} />
        </div>
      </div>

      <div className={styles.infoBloco}>
        <h3>Informações da Propriedade</h3>
        <div className={styles.linha}>
          <label>Nome da propriedade:</label>
          <input name="propriedade" value={form.propriedade} onChange={handleChange} disabled={!editando} />
        </div>
        <div className={styles.linha}>
          <label>Tipo de produção:</label>
          <input name="tipo_producao" value={form.tipo_producao} onChange={handleChange} disabled={!editando} />
        </div>
        <div className={styles.linha}>
          <label>Área (ha):</label>
          <input name="area" value={form.area} onChange={handleChange} disabled={!editando} />
        </div>
        <div className={styles.linha}>
          <label>Cidade:</label>
          <input name="cidade" value={form.cidade} onChange={handleChange} disabled={!editando} />
        </div>
        <div className={styles.linha}>
          <label>Estado:</label>
          <input name="estado" value={form.estado} onChange={handleChange} disabled={!editando} />
        </div>
        <div className={styles.linha}>
          <label>Região:</label>
          <input name="regiao" value={form.regiao} onChange={handleChange} disabled={!editando} />
        </div>
      </div>

      <div className={styles.botoes}>
        {!editando ? (
          <button onClick={() => setEditando(true)}>✏️ Editar</button>
        ) : (
          <button onClick={salvarAlteracoes}>💾 Salvar</button>
        )}
      </div>
    </div>
  );
}
