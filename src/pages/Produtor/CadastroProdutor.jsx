import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import styles from "./CadastroProdutor.module.css";

export default function Cadastro() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    telefone: "",
    nascimento: "",
    propriedade: "",
    tipoProducao: "",
    area: "",
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

    const { data, error: userError } = await supabase.auth.getUser();
    const usuario = data?.user;

    if (!usuario || userError) {
      alert("Não foi possível obter o usuário logado.");
      return;
    }

    const { error: erroUsuario } = await supabase
      .from("usuarios")
      .update({ dados_completos: true })
      .eq("id", usuario.id);

    if (erroUsuario) {
      console.error("Erro ao atualizar usuários:", erroUsuario.message);
      alert("Erro ao salvar dados. Tente novamente.");
      return;
    }

    const { error: erroProdutor } = await supabase
      .from("produtores")
      .insert({
        usuario_id: usuario.id,
        nome: form.nome,
        cpf: form.cpf,
        telefone: form.telefone,
        nascimento: form.nascimento,
        propriedade: form.propriedade,
        tipo_producao: form.tipoProducao,
        area: form.area,
        cidade: form.cidade,
        estado: form.estado,
        regiao: form.regiao,
      });

    if (erroProdutor) {
      console.error("Erro ao cadastrar produtor:", erroProdutor.message);
      alert("Erro ao salvar dados do produtor.");
      return;
    }

    alert("Cadastro realizado com sucesso!");
    navigate("/home-produtor");
  };

  return (
    <div className={styles.container}>
      <h2>📋 Cadastro de Dados do Produtor</h2>
      <p>Preencha os dados abaixo para continuar usando o sistema:</p>

      <form onSubmit={handleSubmit}>
        <input
          name="nome"
          value={form.nome}
          disabled
          placeholder="Nome"
        />
        <input
          name="email"
          value={form.email}
          disabled
          placeholder="Email"
        />

        <input
          name="cpf"
          placeholder="CPF ou CNPJ"
          value={form.cpf}
          onChange={handleChange}
          required
        />
        <input
          name="telefone"
          placeholder="Telefone"
          value={form.telefone}
          onChange={handleChange}
        />
        <div className={styles.linhaHorizontal}>
          <label htmlFor="nascimento">Data de nascimento:</label>
          <input
            id="nascimento"
            name="nascimento"
            type="date"
            value={form.nascimento}
            onChange={handleChange}
          />
        </div>

        <hr />

        <input
          name="propriedade"
          placeholder="Nome da propriedade"
          value={form.propriedade}
          onChange={handleChange}
          required
        />
        <input
          name="tipoProducao"
          placeholder="Tipo de produção"
          value={form.tipoProducao}
          onChange={handleChange}
        />
        <input
          name="area"
          placeholder="Área (hectares)"
          value={form.area}
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
          placeholder="Região/Comunidade"
          value={form.regiao}
          onChange={handleChange}
        />

        <button type="submit">Salvar Dados</button>
      </form>
    </div>
  );
}
