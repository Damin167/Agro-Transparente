import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import styles from "./RelatoriosSindicato.module.css";
import Loading from "../../components/Loading";

export default function RelatoriosSindicato() {
  const [totais, setTotais] = useState({
    afiliados: 0,
    eventos: 0,
    mediaAfiliadosPorEvento: 0,
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function buscarRelatorios() {
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) return;

      const { count: totalAfiliados } = await supabase
        .from("afiliacoes")
        .select("*", { count: "exact", head: true })
        .eq("sindicato_id", user.id);

      const { data: eventos, count: totalEventos } = await supabase
        .from("eventos")
        .select("id", { count: "exact" })
        .eq("sindicato_id", user.id);

      const { data: participacoes } = await supabase
        .from("participacoes_eventos")
        .select("evento_id")
        .in("evento_id", eventos?.map((e) => e.id) || []);

      const media =
        participacoes && participacoes.length > 0 && totalEventos > 0
          ? participacoes.length / totalEventos
          : 0;

      setTotais({
        afiliados: totalAfiliados || 0,
        eventos: totalEventos || 0,
        mediaAfiliadosPorEvento: media.toFixed(1),
      });

      setCarregando(false);
    }

    buscarRelatorios();
  }, []);

  if (carregando) return <Loading />;

  return (
    <div className={`pagina ${styles.container}`}>
      <h2>📊 Relatórios do Sindicato</h2>
      <div className={styles.cards}>
        <div className={styles.card}>
          <h3>👥 Total de Afiliados</h3>
          <p>{totais.afiliados}</p>
        </div>

        <div className={styles.card}>
          <h3>📅 Total de Eventos</h3>
          <p>{totais.eventos}</p>
        </div>

        <div className={styles.card}>
          <h3>📈 Média de Afiliados por Evento</h3>
          <p>{totais.mediaAfiliadosPorEvento}</p>
        </div>
      </div>
    </div>
  );
}
