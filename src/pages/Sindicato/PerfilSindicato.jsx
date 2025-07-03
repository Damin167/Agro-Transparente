import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import styles from "./PerfilSindicato.module.css";
import Loading from "../../components/Loading";

export default function PerfilSindicato() {
  const [form, setForm] = useState(null);
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarDados() {
      const { data: auth } = await supabase.auth.getUser();
      const usuario = auth?.user;

      if (!usuario) return;

      const { data, error } = await supabase
        .from("sindicatos")
        .select("*")
        .eq("id", usuario.id)
        .single();

      if (error) {
        console.error("Erro ao buscar dados do sindicato:", error.message);
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
      .from("sindicatos")
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
  if (!form) return <p className={styles.erro}>Dados do sindicato não encontrados.</p>;

  return (
    <div className={styles.pagina}>
      <h2>🏢 Perfil do Sindicato</h2>

      <div className={styles.infoBloco}>
        <h3>Informações do Sindicato</h3>
        <div className={styles.linha}>
          <label>Nome:</label>
          <input name="nome" value={form.nome} onChange={handleChange} disabled={!editando} />
        </div>
        <div className={styles.linha}>
          <label>Email:</label>
          <input name="email" value={form.email} disabled />
        </div>
        <div className={styles.linha}>
          <label>CNPJ:</label>
          <input name="cnpj" value={form.cnpj || ""} onChange={handleChange} disabled={!editando} />
        </div>
        <div className={styles.linha}>
          <label>Telefone:</label>
          <input name="telefone" value={form.telefone || ""} onChange={handleChange} disabled={!editando} />
        </div>
        <div className={styles.linha}>
          <label>Região:</label>
          <input name="regiao" value={form.regiao || ""} onChange={handleChange} disabled={!editando} />
        </div>
        <div className={styles.linha}>
          <label>Cidade:</label>
          <input name="cidade" value={form.cidade || ""} onChange={handleChange} disabled={!editando} />
        </div>
        <div className={styles.linha}>
          <label>Estado:</label>
          <input name="estado" value={form.estado || ""} onChange={handleChange} disabled={!editando} />
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
