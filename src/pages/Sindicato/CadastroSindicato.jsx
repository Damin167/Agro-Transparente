import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import styles from "./CadastroSindicato.module.css";

export default function DadosSindicato() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cnpj: "",
    telefone: "",
    cidade: "",
    estado: "",
    regiao: "",
  });

  useEffect(() => {
    async function carregarDadosUsuario() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        alert("Erro ao obter usuário autenticado");
        return;
      }

      const { data: dadosUsuario, error: erroUsuario } = await supabase
        .from("usuarios")
        .select("nome, email")
        .eq("id", user.id)
        .single();

      if (erroUsuario || !dadosUsuario) {
        alert("Erro ao buscar dados do usuário.");
        return;
      }

      setForm((formAnterior) => ({
        ...formAnterior,
        nome: dadosUsuario.nome,
        email: dadosUsuario.email,
      }));
    }

    carregarDadosUsuario();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      alert("Erro ao obter usuário autenticado");
      return;
    }

    const { error: erroUsuario } = await supabase
      .from("usuarios")
      .update({ dados_completos: true })
      .eq("id", user.id);

    if (erroUsuario) {
      alert("Erro ao atualizar status do usuário.");
      return;
    }

    const { data, error: erroBusca } = await supabase
      .from("sindicatos")
      .select("id")
      .eq("id", user.id)
      .single();

    if (erroBusca && erroBusca.code !== "PGRST116") {
      alert("Erro ao buscar sindicato: " + erroBusca.message);
      return;
    }

    if (data) {
      const { error: updateError } = await supabase
        .from("sindicatos")
        .update({
          nome: form.nome,
          email: form.email,
          cnpj: form.cnpj,
          telefone: form.telefone,
          cidade: form.cidade,
          estado: form.estado,
          regiao: form.regiao,
        })
        .eq("id", user.id);

      if (updateError) {
        alert("Erro ao atualizar dados: " + updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("sindicatos").insert([
        {
          id: user.id,
          nome: form.nome,
          email: form.email,
          cnpj: form.cnpj,
          telefone: form.telefone,
          cidade: form.cidade,
          estado: form.estado,
          regiao: form.regiao,
        },
      ]);

      if (insertError) {
        alert("Erro ao salvar dados: " + insertError.message);
        return;
      }
    }

    alert("Dados do sindicato salvos com sucesso!");
    navigate("/home-sindicato");
  };

  return (
    <div className={styles.container}>
      <h2>📋 Cadastro de Dados do Sindicato</h2>
      <p>Preencha os dados abaixo para continuar usando o sistema:</p>

      <form onSubmit={handleSubmit}>
        <input
          name="nome"
          placeholder="Nome do Sindicato"
          value={form.nome}
          disabled
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          disabled
        />
        <input
          name="cnpj"
          placeholder="CNPJ"
          value={form.cnpj}
          onChange={handleChange}
          required
        />
        <input
          name="telefone"
          placeholder="Telefone"
          value={form.telefone}
          onChange={handleChange}
        />
        <input
          name="cidade"
          placeholder="Cidade"
          value={form.cidade}
          onChange={handleChange}
        />
        <input
          name="estado"
          placeholder="Estado"
          value={form.estado}
          onChange={handleChange}
        />
        <input
          name="regiao"
          placeholder="Região"
          value={form.regiao}
          onChange={handleChange}
        />

        <button type="submit">Salvar Dados</button>
      </form>
    </div>
  );
}
