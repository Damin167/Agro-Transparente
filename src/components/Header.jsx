import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import styles from "./Header.module.css";

export default function Header() {
  const [usuario, setUsuario] = useState(null);
  const [tipo, setTipo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsuario = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("usuarios")
          .select("nome, tipo_usuario")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setUsuario(data.nome);
          setTipo(data.tipo_usuario);
        }
      }
    };

    fetchUsuario();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("tipoUsuario");
    navigate("/login");
  };

  const irParaHome = () => {
    if (tipo === "produtor") navigate("/home-produtor");
    else if (tipo === "sindicato") navigate("/home-sindicato");
    else navigate("/login");
  };

  const irParaPerfil = () => {
    if (tipo === "produtor") navigate("/perfil-produtor");
    else if (tipo === "sindicato") navigate("/perfil-sindicato");
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 onClick={irParaHome} className={styles.logo}>
          🌱 AgroTransparente
        </h1>
      </div>
      <div className={styles.right}>
        {usuario && (
          <span onClick={irParaPerfil} className={styles.nomeUsuario}>
            👤 {usuario}
          </span>
        )}
        <button onClick={handleLogout}>Sair</button>
      </div>
    </header>
  );
}
