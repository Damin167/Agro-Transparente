import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import styles from "./Afiliados.module.css";
import Loading from "../../components/Loading";

export default function Afiliados() {
  const [afiliados, setAfiliados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchAfiliados() {
      setCarregando(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("afiliacoes")
        .select(`
          *,
          produtores (
            nome,
            cidade,
            estado
          )
        `)
        .eq("sindicato_id", user.id);

      if (!error) {
        setAfiliados(data);
      }

      setCarregando(false);
    }

    fetchAfiliados();
  }, []);

  if (carregando) return <Loading />;

  return (
    <div className={`pagina ${styles.container}`}>
      <h2>🤝 Produtores Afiliados</h2>
      {afiliados.length === 0 ? (
        <p>Nenhum produtor afiliado ainda.</p>
      ) : (
        <div className={styles.listaAfiliados}>
          {afiliados.map((afiliacao) => (
            <div key={afiliacao.id} className={styles.cardAfiliado}>
              <h3>{afiliacao.produtores.nome}</h3>
              <p>📍 {afiliacao.produtores.cidade} - {afiliacao.produtores.estado}</p>
              <p><strong>Afiliado em:</strong> {new Date(afiliacao.data_afiliacao).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
