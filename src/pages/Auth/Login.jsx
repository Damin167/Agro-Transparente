import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import styles from "./Login.module.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      setErro("Email ou senha inválidos");
      return;
    }

    const { data: usuarioData, error: usuarioError } = await supabase
      .from("usuarios")
      .select("tipo_usuario, dados_completos")
      .eq("id", data.user.id)
      .single();

    if (usuarioError || !usuarioData) {
      setErro("Erro ao recuperar dados do usuário.");
      return;
    }

    const { tipo_usuario, dados_completos } = usuarioData;
    localStorage.setItem("tipoUsuario", tipo_usuario);

    if (!dados_completos) {
    if (tipo_usuario === "produtor") {
      navigate("/cadastro-dados-produtor");
    } else if (tipo_usuario === "sindicato") {
      navigate("/cadastro-dados-sindicato");
    } else {
      navigate("/login");
    }
  } else {
    if (tipo_usuario === "produtor") {
      navigate("/home-produtor");
    } else if (tipo_usuario === "sindicato") {
      navigate("/home-sindicato");
    } else {
      navigate("/login");
    }
  }
  };

  return (
    <div className={styles.page}>
      <div className={styles.background}></div>

      <div className={styles.content}>
        <div className={styles.left}>
          <div className={styles.overlay}>
            <h1>🌾 AgroTransparente</h1>
            <br />
            <p>
              Plataforma para <strong>produtores</strong> e <strong>sindicatos</strong> conectarem-se e gerirem dados agrícolas com simplicidade e segurança.
            </p>

            <ul className={styles.lista}>
              <li>📈 Visualize relatórios de produção por tipo, ano e local</li>
              <li>🗺️ Acesse mapas interativos com dados geográficos</li>
              <li>📤 Exporte informações em CSV ou PDF</li>
              <li>🤝 Fortaleça parcerias com sindicatos</li>
              <li>🔐 Dados seguros e acessíveis somente por você</li>
            </ul>

            <p style={{ marginTop: "1.5rem" }}>
              Comece agora e leve sua produção a um novo nível!
            </p>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.container}>
            <h2>🔐 Login</h2>
            <form onSubmit={handleLogin}>
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

              <button type="submit">Entrar</button>
              {erro && <p style={{ color: "red" }}>{erro}</p>}
            </form>
            <p>
              Não tem uma conta? <a href="/register">Cadastre-se</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
