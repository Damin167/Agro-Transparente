import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import styles from "./Register.module.css";


export default function Register() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("produtor");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      alert("Erro: ID do usuário não encontrado.");
      return;
    }

    const { error: insertError } = await supabase.from("usuarios").insert([
      {
        id: userId,
        email,
        tipo_usuario: tipoUsuario,
        nome: nome,
      },
    ]);

    if (insertError) {
      alert("Erro ao salvar dados adicionais: " + insertError.message);
      return;
    }

    alert("Cadastro realizado com sucesso!");
    navigate("/login");
  };

  return (
    <div className={styles.page}>
      <div className={styles.background}></div>

      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.overlay}>
            <h1>🌿 Faça parte da Agricultura Transparente</h1>
            <p>
              Cadastre-se como produtor ou sindicato e contribua para uma rede confiável de informações rurais.
            </p>
            <ul>
              <li>📌 Registre facilmente suas colheitas</li>
              <li>📈 Gere relatórios e acompanhe estatísticas</li>
              <li>🛰️ Compartilhe dados com transparência</li>
              <li>🔐 Ambiente seguro e acessível</li>
            </ul>
            <p style={{ marginTop: "1rem", fontSize: "0.9rem", opacity: 0.8 }}>
              Juntos promovemos a valorização da agricultura familiar no Brasil.
            </p>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.container}>
            <h2>📝 Cadastro de Usuário</h2>
            <form onSubmit={handleRegister}>
              <input
                type="text"
                placeholder="Nome completo"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                type="password"
                placeholder="Senha"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <select
                value={tipoUsuario}
                onChange={(e) => setTipoUsuario(e.target.value)}
                required
              >
                <option value="produtor">Produtor</option>
                <option value="sindicato">Sindicato</option>
              </select>
              <button type="submit">Cadastrar</button>
            </form>
            <p>
              Já tem uma conta? <a href="/login">Faça login</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
